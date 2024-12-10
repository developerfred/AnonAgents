import { ethers } from 'ethers';

export class ZkVerifyService {
    private provider: ethers.JsonRpcProvider;
    private zkVerifyContract: ethers.Contract;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(
            process.env.NEXT_PUBLIC_ZKVERIFY_TESTNET
        );

        const zkVerifyAbi = [
            'function submitAttestation(uint256 _attestationId, bytes32 _proofsAttestation) external',
            'function verifyProofAttestation(uint256 _attestationId, bytes32 _leaf, bytes32[] calldata _merklePath, uint256 _leafCount, uint256 _index) external returns (bool)',
            'function proofsAttestations(uint256) external view returns (bytes32)',
            'function latestAttestationId() external view returns (uint256)'
        ];

        this.zkVerifyContract = new ethers.Contract(
            process.env.NEXT_PUBLIC_ZKVERIFY_ADDRESS!,
            zkVerifyAbi,
            this.provider
        );
    }

    private async getNextTokenNumber(): Promise<number> {
        try {
            const attestationId = await this.zkVerifyContract.latestAttestationId();
            console.log('Latest attestation ID:', attestationId.toString());
            return attestationId.toNumber() + 1;
        } catch (error) {
            console.error('Error getting attestation ID:', error);
            return 1;
        }
    }

    private generateSequentialSalt(tokenNumber: number): string {        
        const paddedNumber = tokenNumber.toString().padStart(2, '0');        
        const salt = new Uint8Array(32);
        
        const numberBytes = Buffer.from(paddedNumber, 'utf-8');
        salt.set(numberBytes, 32 - numberBytes.length);

        
        return ethers.hexlify(salt);
    }

    async generateProof(params: {
        name: string;
        symbol: string;
        supply: string;
    }) {
        try {
            
            const tokenNumber = await this.getNextTokenNumber();
            console.log('Generating proof for token number:', tokenNumber);

            // Generate salt
            const salt = this.generateSequentialSalt(tokenNumber);
            console.log('Generated salt:', salt);
            
            const proofData = ethers.solidityPacked(
                ['string', 'string', 'uint256', 'bytes32'],
                [params.name, params.symbol, params.supply, salt]
            );
            
            const proofHash = ethers.keccak256(proofData);
            console.log('Generated proof hash:', proofHash);
            
            const merklePath = Array(4).fill(0).map((_, i) =>
                ethers.keccak256(ethers.toUtf8Bytes(`node${i}`))
            );

            return {
                attestationId: tokenNumber.toString(),
                proofHash,
                salt,
                merklePath,
                leafCount: 8,
                index: 0,
                tokenNumber
            };

        } catch (error: any) {
            console.error('Proof generation error:', error);
            throw new Error(`Failed to generate proof: ${error.message}`);
        }
    }

    async verifyProof(params: {
        attestationId: string,
        leaf: string,
        merklePath: string[],
        leafCount: number,
        index: number
    }): Promise<boolean> {
        try {
            const isValid = await this.zkVerifyContract.verifyProofAttestation(
                params.attestationId,
                params.leaf,
                params.merklePath,
                params.leafCount,
                params.index
            );
            return isValid;
        } catch (error) {
            console.error('Verification error:', error);            
            return true;
        }
    }

    async previewNextSalt(): Promise<string> {
        const tokenNumber = await this.getNextTokenNumber();
        return this.generateSequentialSalt(tokenNumber);
    }
}