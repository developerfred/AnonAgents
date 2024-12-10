// pages/api/zkverify/generate-proof.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import Redis from 'ioredis';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Initialize provider
const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ZKVERIFY_TESTNET);

// Initialize zkVerify contract
const zkVerifyContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_ZKVERIFY_ADDRESS!,
    [
        'function latestAttestationId() view returns (uint256)',
        'function verifyProofAttestation(uint256 _attestationId, bytes32 _leaf, bytes32[] calldata _merklePath, uint256 _leafCount, uint256 _index) view returns (bool)',
        'function proofsAttestations(uint256) view returns (bytes32)'
    ],
    provider
);

interface ProofRequest {
    name: string;
    symbol: string;
    supply: string;
    salt: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, symbol, supply, salt }: ProofRequest = req.body;

        // Generate packed data for proof
        const proofData = ethers.solidityPacked(
            ['string', 'string', 'uint256', 'bytes32'],
            [name, symbol, supply, salt]
        );

        // Get latest attestation ID
        const attestationId = await zkVerifyContract.latestAttestationId();
        const nextAttestationId = attestationId.toString();

        // Generate leaf hash
        const leaf = ethers.keccak256(proofData);

        // Generate Merkle tree data (simplified for MVP)
        const merkleData = generateMerkleData(leaf);

        // Store proof data in Redis
        const proofKey = `proof:${nextAttestationId}`;
        await redis.setex(proofKey, 3600, JSON.stringify({
            leaf,
            merkleData,
            salt,
            name,
            symbol,
            supply
        }));

        return res.status(200).json({
            attestationId: nextAttestationId,
            proofHash: leaf,
            merkle_path: merkleData.path,
            leaf_count: merkleData.leafCount,
            index: merkleData.index,
            salt
        });

    } catch (error: any) {
        console.error('Proof generation error:', error);
        return res.status(500).json({ error: error.message });
    }
}

function generateMerkleData(leaf: string) {
    // Simplified Merkle tree generation for MVP
    // In production, implement full Merkle tree logic
    const path = Array(4).fill(0).map((_, i) =>
        ethers.keccak256(ethers.toUtf8Bytes(`node${i}`))
    );

    return {
        path,
        leafCount: 8,
        index: 0
    };
}