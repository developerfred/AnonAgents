'use client'
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Sparkles, Lock, BadgeDollarSign } from 'lucide-react';
import ConnectButton from './ConnectButton';
import { ZkVerifyService } from '../services/zkVerifyService';

interface FormState {
    name: string;
    symbol: string;
    supply: string;
    initialTick: string;
    fee: string;
    salt: string;
}

interface DeploymentStatus {
    step: string;
    isLoading: boolean;
    error: string | null;
    success: boolean;
}

const AnonAgentsApp: React.FC = () => {
    const [formData, setFormData] = useState<FormState>({
        name: '',
        symbol: '',
        supply: '',
        initialTick: '0',
        fee: '500', // 0.05% fee
        salt: '',
    });

    const [status, setStatus] = useState<DeploymentStatus>({
        step: '',
        isLoading: false,
        error: null,
        success: false
    });

    const zkVerifyService = new ZkVerifyService();

    const updateStatus = (update: Partial<DeploymentStatus>) => {
        setStatus(prev => ({ ...prev, ...update }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const deployTokenOnBase = async (zkProofData: any) => {
        try {
            updateStatus({ step: 'Deploying token on Base network...' });

            // Connect to Base network
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            // Get contract instance
            const deployer = new ethers.Contract(
                process.env.NEXT_PUBLIC_ANON_AGENTS_ADDRESS!,
                [
                    'function deployToken(bytes32 proofHash, uint256 attestationId, bytes32 salt) payable returns (address)'
                ],
                signer
            );

            // Calculate deployment fee (1%)
            const deploymentFee = ethers.parseEther('0.01');

            // Deploy token
            const tx = await deployer.deployToken(
                zkProofData.proofHash,
                zkProofData.attestationId,
                zkProofData.salt,
                { value: deploymentFee }
            );

            updateStatus({ step: 'Waiting for transaction confirmation...' });
            const receipt = await tx.wait();

            updateStatus({
                step: 'Token deployed successfully!',
                isLoading: false,
                success: true
            });

            return receipt;
        } catch (error: any) {
            throw new Error(`Token deployment failed: ${error.message}`);
        }
    };

    const handleCreateToken = async () => {
        try {
            updateStatus({
                isLoading: true,
                error: null,
                success: false,
                step: 'Initializing proof generation...'
            });

            // Validate inputs
            if (!formData.name || !formData.symbol || !formData.supply) {
                throw new Error('Please fill in all required fields');
            }

            // 1. Generate proof data
            updateStatus({ step: 'Generating proof...' });
            const proofData = await zkVerifyService.generateProof({
                name: formData.name,
                symbol: formData.symbol,
                supply: formData.supply
            });

            updateStatus({ step: `Generated proof for token #${proofData.tokenNumber}` });

            // 2. Deploy token on Base
            updateStatus({ step: 'Deploying token on Base network...' });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const deployer = new ethers.Contract(
                process.env.NEXT_PUBLIC_ANON_AGENTS_ADDRESS!,
                ['function deployToken(bytes32 proofHash, uint256 attestationId, bytes32 salt) payable returns (address)'],
                signer
            );

            const deploymentFee = ethers.parseEther('0.01');

            const tx = await deployer.deployToken(
                proofData.proofHash,
                proofData.attestationId,
                proofData.salt,
                { value: deploymentFee }
            );

            updateStatus({ step: 'Waiting for confirmation...' });
            await tx.wait();

            updateStatus({
                step: `Token #${proofData.tokenNumber} deployed successfully!`,
                isLoading: false,
                success: true
            });

        } catch (err: any) {
            console.error('Error creating token:', err);
            updateStatus({
                isLoading: false,
                error: err.message,
                success: false,
                step: ''
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 p-4 md:p-8">
            <div className="flex-1"><ConnectButton /> </div>
            
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                        AnonAgents
                    </h1>
                    <p className="text-gray-300 text-xl">
                        Create anonymous tokens with built-in anti-sniper protection
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-black/50 backdrop-blur-md border-purple-500/30">
                        <CardHeader>
                            <CardTitle className="text-purple-400 flex items-center gap-2">
                                <Shield className="h-6 w-6" />
                                Create Your Token
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name" className="text-gray-300">Token Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="bg-black/30 border-purple-500/30 text-white"
                                        placeholder="e.g. MyToken"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="symbol" className="text-gray-300">Token Symbol</Label>
                                    <Input
                                        id="symbol"
                                        name="symbol"
                                        value={formData.symbol}
                                        onChange={handleInputChange}
                                        className="bg-black/30 border-purple-500/30 text-white"
                                        placeholder="e.g. MTK"
                                    />
                                </div> 

                                <div>
                                    <Label htmlFor="supply" className="text-gray-300">Total Supply</Label>
                                    <Input
                                        id="supply"
                                        name="supply"
                                        type="number"
                                        value={formData.supply}
                                        onChange={handleInputChange}
                                        className="bg-black/30 border-purple-500/30 text-white"
                                        placeholder="1000000"
                                    />
                                </div>

                                <Button
                                    onClick={handleCreateToken}
                                    disabled={status.isLoading}
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                >
                                    {status.isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            {status.step}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4" />
                                            Create Anonymous Token
                                        </div>
                                    )}
                                </Button>

                                {status.error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{status.error}</AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="bg-black/50 backdrop-blur-md border-purple-500/30">
                            <CardHeader>
                                <CardTitle className="text-purple-400 flex items-center gap-2">
                                    <Lock className="h-6 w-6" />
                                    Anti-Sniper Protection
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-gray-300 space-y-4">
                                    <p className="flex items-center gap-2">
                                        <BadgeDollarSign className="size-5 w-5 text-purple-400" />
                                        1% of initial purchases go to protocol maintenance
                                    </p>
                                    <p>Protected against front-running and sandwich attacks</p>
                                    <p>Secure deployment through zkVerify network</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/50 backdrop-blur-md border-purple-500/30">
                            <CardHeader>
                                <CardTitle className="text-purple-400 flex items-center gap-2">
                                    <Shield className="h-6 w-6" />
                                    Complete Anonymity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-gray-300 space-y-4">
                                    <p>Zero-knowledge proof verification</p>
                                    <p>No trace to creators identity</p>
                                    <p>Decentralized deployment process</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnonAgentsApp;