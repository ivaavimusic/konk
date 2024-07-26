const audio = document.getElementById('background-music');
const muteIcon = document.getElementById('mute-icon');

let isMuted = true; // Initially muted
let hasPlayed = false;

const connectWalletButton = document.getElementById('connect-wallet-button');
const logoutModal = document.getElementById('logout-modal');
const closeModal = document.getElementById('close-modal');
const logoutButton = document.getElementById('logout-button');
const mintButton = document.getElementById('mint-button');
const buyModal = document.getElementById('buy-modal');
const buyModalClose = buyModal.querySelector('.close');
const buyKonkButton = document.querySelector('.buy-konk-button');
const ethInput = document.querySelector('.eth-input');
const ethButtons = document.querySelectorAll('.eth-button');
const errorModal = document.getElementById('error-modal');
const errorModalClose = errorModal.querySelector('.close');
const loaderModal = document.getElementById('loader-modal');

let isConnected = false; // Track connection state
let currentAccount = '';

// Ensure ethers library is loaded
console.log('Ethers library:', window.ethers); // Check if ethers is available

const blastNetwork = {
    chainId: '0x13E31', //0x13E31 is Hexadecimal for 81457 Blast ChainID
    rpcUrls: ['https://rpc.blast.io'],
    chainName: 'Blast Mainnet',
    nativeCurrency: {
        name: 'BLAST',
        symbol: 'BLAST',
        decimals: 18
    },
    blockExplorerUrls: ['https://blastscan.io']
};

muteIcon.addEventListener('click', () => {
    if (!hasPlayed) {
        // Start playing the audio when the user clicks to unmute for the first time
        audio.play().then(() => {
            console.log('Music started playing.');
            hasPlayed = true; // Set the flag after the audio starts
        }).catch(error => {
            console.log('Error occurred while playing music:', error);
        });
    }

    // Toggle mute/unmute
    if (isMuted) {
        audio.muted = false;
        muteIcon.src = '/mute.webp'; // Path to your unmute icon
    } else {
        audio.muted = true;
        muteIcon.src = '/unmute.webp'; // Path to your mute icon
    }
    isMuted = !isMuted;
});

// Function to add and remove vibration class
function toggleVibration() {
    mintButton.classList.toggle('vibrate');
    if (!isMuted) {
        if (!hasPlayed) {
            audio.play().then(() => {
                console.log('Music started playing on hover.');
                hasPlayed = true; // Set the flag after the audio starts
            }).catch(error => {
                console.log('Error occurred while playing music:', error);
            });
        }
    }
}

// Initial call to start vibration after 5 seconds
setTimeout(() => {
    toggleVibration();
    // Set interval to stop vibration after 3 seconds
    setTimeout(() => {
        toggleVibration();
    }, 1000);
}, 3000);

// Set interval to repeat vibration every 5 minutes
setInterval(() => {
    setTimeout(() => {
        toggleVibration();
        // Set interval to stop vibration after 3 seconds
        setTimeout(() => {
            toggleVibration();
        }, 1000);
    }, 3000);
}, 300000);

async function switchToBlastNetwork() {
    if (window.ethereum) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: blastNetwork.chainId }]
            });
            console.log('Switched to Blast Network');
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [blastNetwork]
                    });
                    console.log('Blast Network added and switched');
                } catch (addError) {
                    console.error('Failed to add the Blast Network:', addError);
                    alert('Failed to add the Blast Network');
                }
            } else {
                console.error('Failed to switch to Blast Network:', switchError);
                alert('Failed to switch to Blast Network');
            }
        }
    } else {
        alert('MetaMask is not installed. Please install it to switch networks.');
    }
}

async function connectWallet() {
    if (!isConnected) {
        if (window.ethereum) {
            try {
                // Request accounts to be connected
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                
                if (accounts.length > 0) {
                    currentAccount = accounts[0];
                    const shortAddress = `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
                    // Set the text content and class only once
                    connectWalletButton.textContent = `${shortAddress}`;
                    connectWalletButton.classList.add('connected');
                    isConnected = true;
                    console.log('Wallet connected:', shortAddress);
                } else {
                    alert('No account found. Please allow MetaMask access.');
                }
            } catch (error) {
                console.error('Failed to connect wallet:', error);
                connectWalletButton.textContent = 'Connect Wallet';
                connectWalletButton.classList.remove('connected');
            }
        } else {
            // For mobile devices, attempt to connect MetaMask
            if (isMobileDevice()) {
                // MetaMask deep link
                const dappUrl = encodeURIComponent(window.location.href); // Encode the URL
                const metamaskDeepLink = `metamask://dapp/${dappUrl}`;
                // Attempt to open the MetaMask app
                window.location.href = metamaskDeepLink;

                // Fallback for users who don't have MetaMask installed
                setTimeout(async () => {
                    if (window.location.href === metamaskDeepLink) {
                        alert('Please install MetaMask!');
                    } else {
                        try {
                            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                            if (accounts.length > 0) {
                                currentAccount = accounts[0];
                                const shortAddress = `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
                                connectWalletButton.textContent = `${shortAddress}`;
                                connectWalletButton.classList.add('connected');
                                isConnected = true;
                                console.log('Wallet connected:', shortAddress);
                            } else {
                                alert('No account found. Please allow MetaMask access.');
                            }
                        } catch (error) {
                            console.error('Failed to connect wallet:', error);
                        }
                    }
                }, 1000);
            } else {
                alert('Please install MetaMask!');
            }
        }
    } else {
        // Show the logout modal if already connected
        logoutModal.style.display = 'block';
    }
}

// Utility function to detect if the user is on a mobile device
function isMobileDevice() {
    return /android|iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
}

connectWalletButton.addEventListener('click', connectWallet);


function logout() {
    currentAccount = '';
    connectWalletButton.textContent = 'Connect Wallet';
    connectWalletButton.classList.remove('connected');
    isConnected = false;
    logoutModal.style.display = 'none';
    console.log('Logged out');
}

closeModal.addEventListener('click', () => {
    logoutModal.style.display = 'none';
});

logoutButton.addEventListener('click', logout);

connectWalletButton.addEventListener('click', connectWallet);

mintButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (!isConnected) {
        // Show error modal if wallet is not connected
        errorModal.style.display = 'block';
    } else {
        // Show buy modal if wallet is connected
        buyModal.style.display = 'block';
    }
});

buyModalClose.addEventListener('click', () => {
    buyModal.style.display = 'none';
});

async function buyKonk() {
    const ethAmount = ethInput.value;
    if (ethAmount && window.ethereum && isConnected) {
        // Show loader
        showLoader();

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // Check current network
            const network = await provider.getNetwork();
            console.log('Current network:', network);

            if (network.chainId !== parseInt(blastNetwork.chainId, 16)) {
                // Attempt to switch to the Blast network
                await switchToBlastNetwork();
                // Re-check the network after attempting the switch
                const newNetwork = await provider.getNetwork();
                if (newNetwork.chainId !== parseInt(blastNetwork.chainId, 16)) {
                    alert('Failed to switch to Blast Network');
                    hideLoader();
                    return;
                }
            }

            const contractAddress = '0x66881D937c1828B050Bf234a5f6Ad8d17AbC4021'; // Contract address
            const amountOutMin = ethers.utils.parseUnits('0.0001', 'ether').toHexString(); // Minimum amount out
            const path = ['0x4300000000000000000000000000000000000004', '0x2b9712190Ce9570C1CA860D55B1623Bd88BF96fF']; // ETH to Token
            const to = currentAccount;
            const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now

            const functionSignature = 'swapExactETHForTokens(uint256,address[],address,uint256)';
            const functionSelector = ethers.utils.id(functionSignature).slice(0, 10);
            const encodedParameters = ethers.utils.defaultAbiCoder.encode(
                ['uint256', 'address[]', 'address', 'uint256'],
                [amountOutMin, path, to, deadline]
            );
            const data = functionSelector + encodedParameters.slice(2);

            const tx = {
                to: contractAddress,
                from: currentAccount,
                gasLimit: 2000000, // Estimate or set an appropriate gas limit
                value: ethers.utils.parseUnits(ethAmount, 'ether').toHexString(), // Amount of ETH to send
                data: data
            };

            const txResponse = await signer.sendTransaction(tx);
            console.log('Transaction sent:', txResponse.hash);

            // Wait for the transaction to be confirmed
            const receipt = await txResponse.wait();
            if (receipt.status === 1) {
                // Transaction was successful
                const konkAmount = ethAmount * 1000; // Example conversion rate
                showConfetti();
                showConfirmationModal(txResponse.hash);
                console.log('Transaction confirmed:', txResponse.hash);
            } else {
                console.error('Transaction failed');
            }
        } catch (error) {
            console.error('Transaction failed:', error);
        } finally {
            hideLoader();
        }
    } else {
        console.error('ETH amount is not valid or wallet is not connected');
    }
    buyModal.style.display = 'none';
}

function showConfirmationModal(txHash) {
    const confirmationModal = document.getElementById('confirmation-modal');
    const txLink = `https://blastscan.io/tx/${txHash}`;
    confirmationModal.querySelector('.tx-hash-link').href = txLink;
    confirmationModal.querySelector('.tx-hash-link').textContent = txHash;
    confirmationModal.style.display = 'block';
}

document.getElementById('confirmation-modal-close').addEventListener('click', () => {
    document.getElementById('confirmation-modal').style.display = 'none';
});

buyKonkButton.addEventListener('click', buyKonk);

ethButtons.forEach(button => {
    button.addEventListener('click', () => {
        ethInput.value = button.textContent;
    });
});

errorModalClose.addEventListener('click', () => {
    errorModal.style.display = 'none';
});

function showConfetti() {
    const confetti = window.confetti;
    if (confetti) {
        confetti.create(document.getElementById('confetti-canvas'), {
            resize: true,
            useWorker: true
        })({
            particleCount: 200,
            spread: 200
        });
    } else {
        console.error('Confetti function is not available.');
    }
}

function showLoader() {
    loaderModal.style.display = 'block';
}

function hideLoader() {
    loaderModal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const copyButton = document.getElementById('copy-address-button');
    const address = "0x2b9712190ce9570c1ca860d55b1623bd88bf96ff";

    copyButton.addEventListener('click', () => {
        // Copy the address to the clipboard
        navigator.clipboard.writeText(address)
            .then(() => {
                // Create a "Copied!" message element
                const copyMessage = document.createElement('span');
                copyMessage.textContent = 'Copied!';
                copyMessage.style.display = 'inline-block';
                copyMessage.style.marginLeft = '10px';
                copyMessage.style.color = 'green';
                copyMessage.style.fontWeight = 'bold';

                // Add the message to the container
                copyButton.parentElement.appendChild(copyMessage);

                // Hide the "Copied!" message after 2 seconds
                setTimeout(() => {
                    copyMessage.remove();
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    });
});
