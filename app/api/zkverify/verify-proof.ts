
import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ZKVERIFY_TESTNET);

const zkVerifyContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_ZKVERIFY_ADDRESS!,
    [
        'function verifyProofAttestation(uint256 _attestationId, bytes32 _leaf, bytes32[] calldata _merklePath, uint256 _leafCount, uint256 _index) view returns (bool)'
    ],
    provider
);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { attestationId } = req.query;

    try {
        // Get proof data from Redis
        const proofKey = `proof:${attestationId}`;
        const proofData = await redis.get(proofKey);

        if (!proofData) {
            return res.status(404).json({ error: 'Proof not found' });
        }

        const { leaf, merkleData } = JSON.parse(proofData);

        // Verify proof using contract
        const isValid = await zkVerifyContract.verifyProofAttestation(
            attestationId,
            leaf,
            merkleData.path,
            merkleData.leafCount,
            merkleData.index
        );

        return res.status(200).json({ isValid });

    } catch (error: any) {
        console.error('Proof verification error:', error);
        return res.status(500).json({ error: error.message });
    }
}