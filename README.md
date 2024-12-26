# AnonAgents - Anonymous Token Creation Platform

[![AnonAgentsMovie](https://img.youtube.com/vi/BpwxZHt0-3w/0.jpg)](https://www.youtube.com/watch?v=BpwxZHt0-3w)


## 🏆 Awards & Recognition

AnonAgents was honored as one of the winners of the zkVerify Hackathon! The project was recognized for its innovative approach to:
- Permissionless automation
- Anonymity in token creation and trading
- Seamless dApp integration
- Empowering Web3 with private, secure, and automated task execution

[View Project on Devfolio](https://devfolio.co/projects/anonagents-fe58)
[View on X](https://x.com/ZKVProtocol/status/1872349169790427171)

## 🚀 Overview

AnonAgents is a groundbreaking decentralized platform that enables anonymous token creation with built-in anti-sniper protection. By leveraging zero-knowledge proofs through zkVerify on Sepolia and deploying on the Base network, we ensure complete anonymity while maintaining security and preventing malicious trading activities.

## ✨ Key Features

- **Complete Anonymity**: Zero-knowledge proof verification ensures creator's identity remains hidden
- **Anti-Sniper Protection**: Built-in mechanisms to prevent front-running and sandwich attacks
- **Cross-Chain Security**: Proof validation on Sepolia, token deployment on Base
- **Fair Launch**: 1% protocol fee for maintaining anti-sniper measures
- **Sequential Salt Generation**: Unique deterministic salt generation for enhanced security

## 🛠️ Technical Stack

- **Frontend**: 
  - Next.js 13+
  - React 18+
  - TailwindCSS
  - shadcn/ui
  - ethers.js v6

- **Smart Contracts**:
  - Solidity 0.8.26
  - zkVerify on Sepolia
  - Base Network deployment

## 🔧 Architecture

### Zero-Knowledge Proof Flow
1. User inputs token details (name, symbol, supply)
2. Backend generates sequential salt (0x...01, 0x...02, etc.)
3. zkVerify creates and validates proof on Sepolia
4. Verified proof is used for token deployment on Base

### Anti-Sniper Protection
- Proof-based deployment prevents front-running
- Protocol fee creates economic barrier against sniping
- Protected initial trades through verified attestations

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/developerfred/AnonAgents
cd AnonAgents

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values
```

## 🔑 Environment Setup

```env
NEXT_PUBLIC_ZKVERIFY_ADDRESS=your_zkverify_contract
NEXT_PUBLIC_ZKVERIFY_TESTNET=https://sepolia.zkverify.io
NEXT_PUBLIC_ANON_AGENTS_ADDRESS=your_deployer_contract
REDIS_URL=redis://localhost:6379
```

## 🚀 Running the Project

```bash
# Start Redis for proof caching
docker run -d -p 6379:6379 redis:alpine

# Run development server
npm run dev
```

## 🔄 Token Creation Flow

1. **Frontend Input**
   - User provides token details
   - Interface ensures data validation

2. **Proof Generation**
   ```typescript
   POST /api/zkverify/generate-proof
   {
     name: "TokenName",
     symbol: "TKN",
     supply: "1000000",
     salt: "0x...01" // Auto-generated
   }
   ```

3. **Verification**
   ```typescript
   GET /api/zkverify/verify-proof?attestationId=123
   ```

4. **Token Deployment**
   - Verified proof submitted to Base network
   - Anti-sniper protection activated
   - Token deployed with anonymity preserved

## 💡 Innovation Highlights

- **Novel Salt Generation**: Unique sequential salt mechanism ensures deterministic yet secure token creation
- **Cross-Chain Security**: Leveraging Sepolia for proofs and Base for deployment
- **Privacy-First Design**: Complete anonymity through zero-knowledge proofs
- **Anti-Sniper Innovation**: Economic and technical measures against malicious trading

## 🔒 Security Features

- Zero-knowledge proof verification
- Merkle tree validation
- Sequential salt generation
- Protected initial trading period
- Economic sniping prevention

## 🎯 Use Cases

1. **Anonymous Project Launches**
   - Teams wanting to avoid pre-launch speculation
   - Fair opportunity for all participants

2. **Protected Token Creation**
   - Prevention of front-running attacks
   - Equitable distribution mechanisms

3. **Decentralized Anonymity**
   - Privacy-focused token launches
   - Protected creator identity

## 🛣️ Roadmap

- [x] MVP with basic proof generation
- [x] Anti-sniper protection implementation
- [x] Base network integration
- [ ] Enhanced Merkle tree implementation
- [ ] Multiple token standards support
- [ ] Advanced trading protection features

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.


## 📞 Contact

- Warpcast: [@codingsh]
- Twitter: [@codingsh]

---

Built with ❤️ by codingsh
