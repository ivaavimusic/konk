// DOM Elements
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

// Connection state
let isConnected = false;
let currentAccount = '';
let isInstructionsVisible = false;

// Blast Network Configuration
const blastNetwork = {
    chainId: '0x13E31', // Hexadecimal for 81457 (Blast ChainID)
    rpcUrls: ['https://rpc.blast.io'],
    chainName: 'Blast Mainnet',
    nativeCurrency: {
        name: 'BLAST',
        symbol: 'BLAST',
        decimals: 18
    },
    blockExplorerUrls: ['https://blastscan.io']
};


// Initial vibration setup
setTimeout(() => {
    toggleVibration();
    setTimeout(() => {
        toggleVibration();
    }, 1000);
}, 3000);

// Periodic vibration
setInterval(() => {
    setTimeout(() => {
        toggleVibration();
        setTimeout(() => {
            toggleVibration();
        }, 1000);
    }, 3000);
}, 300000);

// Blockchain Functions
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

// Wallet Connection
async function connectWallet() {
    if (!isConnected) {
        if (window.ethereum) {
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
                connectWalletButton.textContent = 'Connect Wallet';
                connectWalletButton.classList.remove('connected');
            }
        } else {
            if (isMobileDevice()) {
                const dappUrl = encodeURIComponent(window.location.href);
                const metamaskDeepLink = `metamask://dapp/${dappUrl}`;
                window.location.href = metamaskDeepLink;

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
        logoutModal.style.display = 'block';
    }
}

function isMobileDevice() {
    return /android|iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
}

// Wallet Logout
function logout() {
    currentAccount = '';
    connectWalletButton.textContent = 'Connect Wallet';
    connectWalletButton.classList.remove('connected');
    isConnected = false;
    logoutModal.style.display = 'none';
    console.log('Logged out');
}

// Event Listeners for Buy/Mint Button
// mintButton.addEventListener('click', (event) => {
//     event.preventDefault();
//     document.querySelector('.horizontal-scroll-wrapper').style.transform = 'translateX(-100vw)';
//     isInstructionsVisible = true;
// });

document.querySelector('.how-to-buy').addEventListener('click', showInstructions);

document.querySelector('.back-button').addEventListener('click', () => {
    const wrapper = document.querySelector('.horizontal-scroll-wrapper');
    wrapper.style.transform = 'translateX(0)';
});

function backToMain() {
    const wrapper = document.querySelector('.horizontal-scroll-wrapper');
    wrapper.style.transform = 'translateX(0)';
}

// UI Helper Functions
function showConfirmationModal(txHash) {
    const confirmationModal = document.getElementById('confirmation-modal');
    const txLink = `https://blastscan.io/tx/${txHash}`;
    confirmationModal.querySelector('.tx-hash-link').href = txLink;
    confirmationModal.querySelector('.tx-hash-link').textContent = txHash;
    confirmationModal.style.display = 'block';
}

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
    }
}

function showLoader() {
    loaderModal.style.display = 'block';
}

function hideLoader() {
    loaderModal.style.display = 'none';
}

// Event Listeners
closeModal.addEventListener('click', () => logoutModal.style.display = 'none');
logoutButton.addEventListener('click', logout);
connectWalletButton.addEventListener('click', connectWallet);
buyModalClose.addEventListener('click', () => buyModal.style.display = 'none');
errorModalClose.addEventListener('click', () => errorModal.style.display = 'none');
document.getElementById('confirmation-modal-close').addEventListener('click', () => {
    document.getElementById('confirmation-modal').style.display = 'none';
});

ethButtons.forEach(button => {
    button.addEventListener('click', () => {
        ethInput.value = button.textContent;
    });
});

// Copy Address Functionality
document.addEventListener('DOMContentLoaded', () => {
    const copyButton = document.getElementById('copy-address-button');
    const address = "0x2b9712190ce9570c1ca860d55b1623bd88bf96ff";

    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(address)
            .then(() => {
                const copyMessage = document.createElement('span');
                copyMessage.textContent = 'Copied!';
                copyMessage.style.display = 'inline-block';
                copyMessage.style.marginLeft = '10px';
                copyMessage.style.color = 'green';
                copyMessage.style.fontWeight = 'bold';

                copyButton.parentElement.appendChild(copyMessage);

                setTimeout(() => {
                    copyMessage.remove();
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    });
});

// Background Animation
var c = document.getElementById("c");
var ctx = c.getContext("2d");
var cH, cW;
var bgColor = "#FEA304";
var animations = [];
var circles = [];

var colorPicker = (function() {
    var colors = ["#FF6138", "#FFBE53", "#2980B9", "#282741", "#f15bb5", "#b4cded"];
    var index = 0;
    function next() {
        index = index++ < colors.length-1 ? index : 0;
        return colors[index];
    }
    function current() {
        return colors[index];
    }
    return {
        next: next,
        current: current
    };
})();

function removeAnimation(animation) {
    var index = animations.indexOf(animation);
    if (index > -1) animations.splice(index, 1);
}

function calcPageFillRadius(x, y) {
    var l = Math.max(x - 0, cW - x);
    var h = Math.max(y - 0, cH - y);
    return Math.sqrt(Math.pow(l, 2) + Math.pow(h, 2));
}

function addClickListeners() {
    document.addEventListener("touchstart", handleEvent);
    document.addEventListener("mousedown", handleEvent);
}

function handleEvent(e) {
    if (e.touches) {
        e.preventDefault();
        e = e.touches[0];
    }
    var currentColor = colorPicker.current();
    var nextColor = colorPicker.next();
    var targetR = calcPageFillRadius(e.pageX, e.pageY);
    var rippleSize = Math.min(200, (cW * .4));
    var minCoverDuration = 750;

    var pageFill = new Circle({
        x: e.pageX,
        y: e.pageY,
        r: 0,
        fill: nextColor
    });

    var fillAnimation = anime({
        targets: pageFill,
        r: targetR,
        duration:  Math.max(targetR / 2 , minCoverDuration),
        easing: "easeOutQuart",
        complete: function(){
            bgColor = pageFill.fill;
            removeAnimation(fillAnimation);
        }
    });

    var ripple = new Circle({
        x: e.pageX,
        y: e.pageY,
        r: 0,
        fill: currentColor,
        stroke: {
            width: 3,
            color: currentColor
        },
        opacity: 1
    });

    var rippleAnimation = anime({
        targets: ripple,
        r: rippleSize,
        opacity: 0,
        easing: "easeOutExpo",
        duration: 900,
        complete: removeAnimation
    });

    var particles = [];
    for (var i = 0; i < 32; i++) {
        var particle = new Circle({
            x: e.pageX,
            y: e.pageY,
            fill: currentColor,
            r: anime.random(24, 48)
        });
        particles.push(particle);
    }

    var particlesAnimation = anime({
        targets: particles,
        x: function(particle) {
            return particle.x + anime.random(rippleSize, -rippleSize);
        },
        y: function(particle) {
            return particle.y + anime.random(rippleSize * 1.15, -rippleSize * 1.15);
        },
        r: 0,
        easing: "easeOutExpo",
        duration: anime.random(1000,1300),
        complete: removeAnimation
    });
    
    animations.push(fillAnimation, rippleAnimation, particlesAnimation);
}

function extend(a, b) {
    for(var key in b) {
        if(b.hasOwnProperty(key)) {
            a[key] = b[key];
        }
    }
    return a;
}

var Circle = function(opts) {
    extend(this, opts);
};

Circle.prototype.draw = function() {
    ctx.globalAlpha = this.opacity || 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
    if (this.stroke) {
        ctx.strokeStyle = this.stroke.color;
        ctx.lineWidth = this.stroke.width;
        ctx.stroke();
    }
    if (this.fill) {
        ctx.fillStyle = this.fill;
        ctx.fill();
    }
    ctx.closePath();
    ctx.globalAlpha = 1;
};

var animate = anime({
    duration: Infinity,
    update: function() {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, cW, cH);
        animations.forEach(function(anim) {
            anim.animatables.forEach(function(animatable) {
                animatable.target.draw();
            });
        });
    }
});

var resizeCanvas = function() {
    cW = window.innerWidth;
    cH = window.innerHeight;
    c.width = cW * devicePixelRatio;
    c.height = cH * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
};

(function init() {
    resizeCanvas();
    if (window.CP) {
        window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 6000; 
    }
    window.addEventListener("resize", resizeCanvas);
    addClickListeners();
    handleInactiveUser();
})();

function handleInactiveUser() {
    var inactive = setTimeout(function(){
        fauxClick(cW/2, cH/2);
    }, 2000);
    
    function clearInactiveTimeout() {
        clearTimeout(inactive);
        document.removeEventListener("mousedown", clearInactiveTimeout);
        document.removeEventListener("touchstart", clearInactiveTimeout);
    }
    
    document.addEventListener("mousedown", clearInactiveTimeout);
    document.addEventListener("touchstart", clearInactiveTimeout);
}

function startFauxClicking() {
    setTimeout(function(){
        fauxClick(anime.random(cW * .2, cW * .8), anime.random(cH * .2, cH * .8));
        startFauxClicking();
    }, anime.random(200, 900));
}

function fauxClick(x, y) {
    var fauxClick = new Event("mousedown");
    fauxClick.pageX = x;
    fauxClick.pageY = y;
    document.dispatchEvent(fauxClick);
}

// Add copy functionality for the new instructions section
document.querySelector('.copy-ca').addEventListener('click', function() {
    const address = "0x2b9712190ce9570c1ca860d55b1623bd88bf96ff";
    navigator.clipboard.writeText(address).then(() => {
        const originalText = this.textContent;
        this.textContent = 'Copied!';
        setTimeout(() => {
            this.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
});

function showInstructions() {
    const wrapper = document.querySelector('.horizontal-scroll-wrapper');
    wrapper.style.transform = 'translateX(-100vw)';
}

function showSwap() {
    document.querySelector('.horizontal-scroll-wrapper').style.transform = 'translateX(-200vw)';
}

// Add button to instructions page to navigate to swap
document.querySelector('.proceed-button').addEventListener('click', (e) => {
    e.preventDefault();
    showSwap();
});

function initRunningKONK() {
    const konk = document.getElementById('running-konk');
    const konkSprite = konk.querySelector('.konk-sprite');
    let x = 0;
    let y = 0;
    let directionX = 1;
    let directionY = 1;
    const speed = 8;
    let isChasing = false;
    let isTouchingCursor = false;
    let mouseX = 0;
    let mouseY = 0;
    let memeQueue = [];
    let isOffscreen = false;
    let returnTimeout = null;
    let lastFootprintTime = 0;
    let lastMemeTime = 0;

    // Content arrays
    const konkPhrases = [
        "Konk You!",
        "KONK IT!",
        "KONKKONKKONK",
        "KOOOONK",
        "You Konkussy",
        "Hold my KONK",
        "Get KONKED",
        "KONK ME",
        "KONKING TIME"
    ];

    const konkColors = [
        '#FFFFFF', // White
        '#FFA500', // Orange
        '#FFD700', // Gold
        '#FFEBCD', // BlanchedAlmond
        '#FFE4B5'  // Moccasin
    ];

    const memes = [
        '/meme1.png',
        '/meme2.png',
        '/meme3.png',
        '/meme4.png',
        '/meme5.png',
        '/meme6.png',
        '/meme7.png',
        '/meme8.png',
        '/meme9.png',
        '/meme10.png',
        '/meme11.png',
        '/meme12.png',
        '/meme13.png',
        '/meme14.png',
        '/meme16.png',
        '/meme17.png',
        '/meme18.png',
        '/meme19.png',
        '/meme20.png'
    ];

    // Create containers
    const footprintsContainer = document.createElement('div');
    footprintsContainer.className = 'footprints-container';
    document.body.appendChild(footprintsContainer);

    const textContainer = document.createElement('div');
    textContainer.className = 'text-container';
    document.body.appendChild(textContainer);

    const memesContainer = document.createElement('div');
    memesContainer.className = 'memes-container';
    document.body.appendChild(memesContainer);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .footprint {
            position: fixed;
            width: 12px;
            height: 18px;
            background: rgba(0, 0, 0, 0.15);
            border-radius: 50%;
            pointer-events: none;
            animation: fadeFootprint 30s forwards;
        }

        .konk-text {
            position: fixed;
            font-family: 'Fredoka', sans-serif;
            font-weight: bold;
            font-size: 24px;
            pointer-events: none;
            z-index: 1000;
            white-space: nowrap;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            animation: floatText 5s forwards ease-out;
        }

        .meme-drop {
            position: fixed;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: dropMeme 1s forwards cubic-bezier(0.25, 0.46, 0.45, 0.94);
            transition: opacity 1s ease;
            z-index: 1;
        }

        @keyframes fadeFootprint {
            0% { opacity: 0.3; }
            80% { opacity: 0.2; }
            100% { opacity: 0; }
        }

        @keyframes floatText {
            0% { 
                transform: translateY(0) scale(1);
                opacity: 1;
            }
            100% { 
                transform: translateY(-60px) scale(0.8);
                opacity: 0;
            }
        }

        @keyframes dropMeme {
            0% { 
                transform: scale(0) rotate(-10deg);
                opacity: 0;
            }
            100% { 
                transform: scale(1) rotate(0deg);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    function createFootprint() {
        const footprint = document.createElement('div');
        footprint.className = 'footprint';
        footprint.style.left = `${x + 40}px`;
        footprint.style.top = `${y + 60}px`;
        footprint.style.transform = `rotate(${Math.atan2(directionY, directionX) * 180 / Math.PI}deg)`;
        footprintsContainer.appendChild(footprint);

        setTimeout(() => footprint.remove(), 5000);
    }

    function createFloatingText() {
        if (!isTouchingCursor) return;

        const text = document.createElement('div');
        text.className = 'konk-text';
        text.textContent = konkPhrases[Math.floor(Math.random() * konkPhrases.length)];
        text.style.color = konkColors[Math.floor(Math.random() * konkColors.length)];
        text.style.left = `${x}px`;
        text.style.top = `${y}px`;

        textContainer.appendChild(text);
        setTimeout(() => text.remove(), 2000);
    }

    function dropMemeAtPosition(posX, posY) {
        const meme = document.createElement('img');
        meme.className = 'meme-drop';
        meme.src = memes[Math.floor(Math.random() * memes.length)];
        
        const size = Math.random() * 70 + 80;
        meme.style.width = `${size}px`;
        meme.style.height = `${size}px`;
        meme.style.left = `${posX}px`;
        meme.style.top = `${posY}px`;
        
        memesContainer.appendChild(meme);
        memeQueue.push(meme);

        setTimeout(() => removeMemeSequentially(), 5000);
    }

    function removeMemeSequentially() {
        if (memeQueue.length > 0) {
            const meme = memeQueue.shift();
            meme.style.opacity = '0';
            setTimeout(() => meme.remove(), 1000);
        }
    }

    function checkCollision(x1, y1, x2, y2, threshold = 40) {
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        return distance < threshold;
    }

    function moveTowardsMouse() {
        const dx = mouseX - x;
        const dy = mouseY - y;
        const angle = Math.atan2(dy, dx);
        
        x += Math.cos(angle) * speed;
        y += Math.sin(angle) * speed;
        
        directionX = Math.cos(angle) > 0 ? 1 : -1;

        if (checkCollision(x, y, mouseX, mouseY)) {
            if (!isTouchingCursor) {
                isTouchingCursor = true;
                createFloatingText();
                const textInterval = setInterval(createFloatingText, 300);
                
                const clickHandler = () => {
                    if (!isOffscreen) {
                        isTouchingCursor = false;
                        isChasing = false;
                        clearInterval(textInterval);
                        document.removeEventListener('click', clickHandler);
                        
                        directionX = Math.random() > 0.5 ? 1 : -1;
                        directionY = Math.random() > 0.5 ? 1 : -1;
                    }
                };
                document.addEventListener('click', clickHandler);
            }
        } else {
            isTouchingCursor = false;
        }
    }

    const soundEffects = [
        '/sounds/wazup.mp3',
        '/sounds/konkkonk.mp3'
    ];

    // Create audio element for sound effects
    const soundEffect = new Audio();
    soundEffect.volume = 0.3;

    // Random KONK KONK interval
    setInterval(() => {
        if (!isOffscreen && !isChasing && Math.random() < 0.1) { // 10% chance every 5 seconds
            const text = document.createElement('div');
            text.className = 'konk-text';
            text.textContent = "KONK KONK";
            text.style.color = konkColors[Math.floor(Math.random() * konkColors.length)];
            text.style.left = `${x}px`;
            text.style.top = `${y}px`;
            textContainer.appendChild(text);
            setTimeout(() => text.remove(), 2000);
        }
    }, 5000);

    function playRandomSound() {
        const randomSound = soundEffects[Math.floor(Math.random() * soundEffects.length)];
        soundEffect.src = randomSound;
        soundEffect.play().catch(err => console.log('Sound play failed:', err));
    }

    function goOffscreenAndReturnWithMeme() {
        if (isChasing || isOffscreen) return;
        
        isOffscreen = true;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Determine exit direction based on current momentum and position
        let exitEdge;
        if (x <= 0) exitEdge = 3; // left
        else if (x >= screenWidth - 80) exitEdge = 1; // right
        else if (y <= 0) exitEdge = 0; // top
        else if (y >= screenHeight - 80) exitEdge = 2; // bottom

        // Continue movement in current direction but off screen
        let progress = 0;
        let startX = x;
        let startY = y;
        let targetX = x;
        let targetY = y;

        // Set target position based on exit edge
        switch(exitEdge) {
            case 0: // top
                targetY = -200;
                break;
            case 1: // right
                targetX = screenWidth + 200;
                break;
            case 2: // bottom
                targetY = screenHeight + 200;
                break;
            case 3: // left
                targetX = -200;
                break;
        }

        function animateExit() {
            if (progress < 1) {
                progress += 0.02; // Slower exit
                x = startX + (targetX - startX) * progress;
                y = startY + (targetY - startY) * progress;
                requestAnimationFrame(animateExit);
            } else {
                returnTimeout = setTimeout(() => returnWithMeme(exitEdge), 500);
            }
        }
        animateExit();
    }

    function returnWithMeme() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Play sound effect when returning
        playRandomSound();

        // Create meme that follows KONK back on screen
        const returningMeme = document.createElement('img');
        returningMeme.className = 'meme-drop returning-meme';
        returningMeme.src = memes[Math.floor(Math.random() * memes.length)];
        const size = Math.random() * 70 + 80;
        returningMeme.style.width = `${size}px`;
        returningMeme.style.height = `${size}px`;
        returningMeme.style.position = 'fixed';
        returningMeme.style.transition = 'all 0.5s ease-out';
        returningMeme.style.opacity = '1';
        returningMeme.style.transform = 'scale(0.7)';
        memesContainer.appendChild(returningMeme);

        // Randomly choose return position along screen edge opposite to exit
        let returnX, returnY;
        if (x < 0) { // If exited left, enter from right
            returnX = screenWidth + 100;
            returnY = Math.random() * screenHeight;
            directionX = -1;
        } else if (x > screenWidth) { // If exited right, enter from left
            returnX = -100;
            returnY = Math.random() * screenHeight;
            directionX = 1;
        } else if (y < 0) { // If exited top, enter from bottom
            returnX = Math.random() * screenWidth;
            returnY = screenHeight + 100;
            directionY = -1;
        } else { // If exited bottom, enter from top
            returnX = Math.random() * screenWidth;
            returnY = -100;
            directionY = 1;
        }

        // Animate return with meme
        let progress = 0;
        const targetX = Math.random() * (screenWidth - 200) + 100;
        const targetY = Math.random() * (screenHeight - 200) + 100;
        const startX = returnX;
        const startY = returnY;

        function animateReturn() {
            if (progress < 1) {
                progress += 0.02;
                x = startX + (targetX - startX) * progress;
                y = startY + (targetY - startY) * progress;

                // Update returning meme position
                returningMeme.style.left = `${x + 40}px`;
                returningMeme.style.top = `${y + 40}px`;

                requestAnimationFrame(animateReturn);
            } else {
                // Drop meme at final position
                setTimeout(() => {
                    returningMeme.style.transition = 'all 0.5s ease-out';
                    returningMeme.style.left = `${Math.random() * (screenWidth - size)}px`;
                    returningMeme.style.top = `${Math.random() * (screenHeight - size)}px`;
                    returningMeme.style.transform = 'scale(1)';
                    
                    memeQueue.push(returningMeme);
                    setTimeout(() => removeMemeSequentially(), 5000);
                }, 200);

                isOffscreen = false;
            }
        }

        x = returnX;
        y = returnY;
        animateReturn();
    }

    function moveKONK() {
        if (isChasing && !isOffscreen) {
            moveTowardsMouse();
        } else if (!isOffscreen) {
            x += speed * directionX;
            y += speed * directionY;

            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            
            // Check if KONK hits the edge
            if ((x <= 0 || x >= screenWidth - 80 || y <= 0 || y >= screenHeight - 80) && 
                !isChasing && Math.random() < 0.3) {
                goOffscreenAndReturnWithMeme();
            } else {
                // Regular bounce if not going offscreen
                if (x <= 0 || x >= screenWidth - 80) directionX *= -1;
                if (y <= 0 || y >= screenHeight - 80) directionY *= -1;
            }
        }

        // Update KONK position and create footprints
        if (!isOffscreen) {
            const currentTime = Date.now();
            if (currentTime - lastFootprintTime > 100) {
                createFootprint();
                lastFootprintTime = currentTime;
            }
        }

        konk.style.left = `${x}px`;
        konk.style.top = `${y}px`;
        konk.style.transform = `scaleX(${directionX})`;

        requestAnimationFrame(moveKONK);
    }

    // Random chase behavior
    setInterval(() => {
        if (!isTouchingCursor && !isOffscreen && Math.random() < 0.2) {
            isChasing = !isChasing;
        }
    }, 3000);

    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        x = Math.min(Math.max(x, 0), screenWidth - 80);
        y = Math.min(Math.max(y, 0), screenHeight - 80);
    });

    // Cleanup function for state reset
    function resetState() {
        isOffscreen = false;
        if (returnTimeout) {
            clearTimeout(returnTimeout);
            returnTimeout = null;
        }
        isChasing = false;
        isTouchingCursor = false;
    }

    // Add cleanup to click handler
    document.addEventListener('click', () => {
        if (!isOffscreen) {
            resetState();
        }
    });

    // Initial random position
    x = Math.random() * (window.innerWidth - 80);
    y = Math.random() * (window.innerHeight - 80);

    // Start animation
    moveKONK();
}



const songs = [
    { title: "KONK Theme", url: "/Kiyosonk.mp3" },
    { title: "Konker Drill", url: "/KonkerDrill.mp3" },
    { title: "Keep Konking", url: "/KeepKonkingOn.mp3" }
];

let currentSongIndex = 0;
let isPlaying = false;

const player = {
    audio: new Audio(songs[0].url),
    playButton: document.querySelector('.play-button'),
    prevButton: document.querySelector('.prev-button'),
    nextButton: document.querySelector('.next-button'),
    nowPlaying: document.querySelector('.now-playing'),
    
    init() {
        this.audio.volume = 0.7;
        this.attachEventListeners();
        this.updateNowPlaying();
    },

    attachEventListeners() {
        this.playButton.addEventListener('click', () => this.togglePlay());
        this.prevButton.addEventListener('click', () => this.prev());
        this.nextButton.addEventListener('click', () => this.next());
        
        this.audio.addEventListener('ended', () => this.next());
    },

    togglePlay() {
        if (isPlaying) {
            this.audio.pause();
            this.playButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        } else {
            this.audio.play();
            this.playButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        }
        isPlaying = !isPlaying;
    },

    prev() {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        this.changeSong();
    },

    next() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        this.changeSong();
    },

    changeSong() {
        const wasPlaying = !this.audio.paused;
        this.audio.src = songs[currentSongIndex].url;
        this.updateNowPlaying();
        if (wasPlaying) {
            this.audio.play();
        }
    },

    updateNowPlaying() {
        this.nowPlaying.textContent = `Now Playing: ${songs[currentSongIndex].title}`;
    }
};

// Testimonial data array (keep at top of your scripts.js)
// const testimonialData = [
//     {
//         name: "KONK Enjoyer",
//         username: "@KONKFan",
//         avatar: "/KonkFace.webp",
//         content: "Just got KONKED! Best decision ever! 🚀"
//     },
//     {
//         name: "KONK Enjoyer",
//         username: "@KONKFan",
//         avatar: "/KonkFace.webp",
//         content: "Best $KONK community ever! To the moon! 🌙"
//     },
//     {
//         name: "KONK Enjoyer",
//         username: "@KONKFan",
//         avatar: "/KonkFace.webp",
//         content: "Love the KONK vibes! Let's KONK it! 💪"
//     }
// ];

// function initFloatingTestimonials() {
//     const maxVisibleTestimonials = 4;
//     let activeTestimonials = [];

//     function isPositionValid(x, y) {
//         // Check if position is in center of screen
//         const screenW = window.innerWidth;
//         const screenH = window.innerHeight;
//         const centerX = screenW / 2;
//         const centerY = screenH / 2;
//         const centerPadding = 300; // Avoid center area

//         // Return false if in center area
//         if (Math.abs(x - centerX) < centerPadding && Math.abs(y - centerY) < centerPadding) {
//             return false;
//         }

//         // Check overlap with existing testimonials
//         for (let testimonial of activeTestimonials) {
//             const rect = testimonial.getBoundingClientRect();
//             const padding = 20;
//             if (!(x + 300 + padding < rect.left || 
//                 x - padding > rect.right || 
//                 y + 150 + padding < rect.top || 
//                 y - padding > rect.bottom)) {
//                 return false;
//             }
//         }

//         return true;
//     }

//     function getValidPosition() {
//         const screenW = window.innerWidth;
//         const screenH = window.innerHeight;
//         const padding = 20;
//         let attempts = 0;

//         while (attempts < 50) {
//             const x = padding + Math.random() * (screenW - 350);
//             const y = padding + Math.random() * (screenH - 200);

//             if (isPositionValid(x, y)) {
//                 return { x, y };
//             }
//             attempts++;
//         }
//         return null;
//     }

//     function createTestimonial() {
//         const position = getValidPosition();
//         if (!position) return null;

//         const card = document.createElement('div');
//         card.className = 'floating-testimonial';
        
//         const testimonial = testimonialData[Math.floor(Math.random() * testimonialData.length)];
        
//         card.style.cssText = `
//             position: fixed;
//             left: ${position.x}px;
//             top: ${position.y}px;
//             opacity: 0;
//             transform: scale(0.8);
//             z-index: 2000;
//         `;

//         card.innerHTML = `
//             <div class="testimonial-header">
//                 <img src="${testimonial.avatar}" alt="KONK" class="testimonial-avatar">
//                 <div>
//                     <div class="testimonial-name">${testimonial.name}</div>
//                     <div class="testimonial-username">${testimonial.username}</div>
//                 </div>
//             </div>
//             <div class="testimonial-content">${testimonial.content}</div>
//         `;

//         document.body.appendChild(card);
        
//         setTimeout(() => {
//             card.style.opacity = '1';
//             card.style.transform = 'scale(1)';
//         }, 100);

//         setTimeout(() => {
//             card.style.opacity = '0';
//             setTimeout(() => {
//                 card.remove();
//                 activeTestimonials = activeTestimonials.filter(t => t !== card);
//                 addTestimonial();
//             }, 500);
//         }, 7000);

//         return card;
//     }

//     function addTestimonial() {
//         if (activeTestimonials.length < maxVisibleTestimonials) {
//             const card = createTestimonial();
//             if (card) {
//                 activeTestimonials.push(card);
//             }
//         }
//     }

//     // Start with 2 testimonials
//     setTimeout(() => addTestimonial(), 1000);
//     setTimeout(() => addTestimonial(), 2000);
// }

// // Make sure this line is in your initialization
// document.addEventListener('DOMContentLoaded', () => {
//     player.init();
//     initFloatingTestimonials();
// });

const tweets = [
    {
        name: "IcoBeast.eth🦇🔊",
        username: "@beast_ico",
        avatar: "/pfp/beast.jpg",
        content: "Pretty happy to see Konk get some love on Blast. Dev has been building stuff since Blast started and just never really got much exposure. Bet you didn’t know he’s built out an entire PWA (called like KONK World or something along those lines) with a bunch of mini games 👀",
        link: "https://x.com/beast_ico/status/1850237725414416542"
    },
    {
        name: "Zora",
        username: "@ZoraWeb3",
        avatar: "/pfp/zora.jpg",
        content: "Stoked to seeing kiyosonk getting the recognition they so much deserved. They have been hustling, grinding and working consistently day after day. Amazing how great things keep happening to those who work hard 💛",
        link: "https://x.com/ZoraWeb3/status/1850517737564450919"
    },

    {
        name: "Satsy",
        username: "@Satsyxbt",
        avatar: "/pfp/satsy.jpg",
        content: "My favorite dApp is $KONK no CAP!!!I use it all day. Love everything about the token! I don't use it for gold. It's Pure Utility!",
        link: "https://twitter.com/KIYOSONK/status/1764160434569429095"
    },

    {
        name: "Untamed Adam",
        username: "@adamagb",
        avatar: "/pfp/adam.jpg",
        content: "memecoin kiyosonk($KONK) soared to a $100K market cap after graduating from launchpad TornadoBlastand getting listed on Pacbotapp ➡️ (cont'd) They also teased a run-to-earn app in the future + a collab with @newblastcity➡️ (cont'd) Their dev's been grinding forever and even setup a mining pool for another Blast token, $HYPERS. Love to see their success!",
        link: "https://x.com/adamagb/status/1850892765812686999"
    },

    {
        name: "Omi 🍊| Thrusterfi",
        username: "@ThrusterTitan",
        avatar: "/pfp/omi.jpg",
        content: "👑 @kiyosonk: The Meme King of BLAST Gold @kiyosonk isn’t just another memecoin - it’s a alpha generating MACHINE! This project is building its OWN ecosystem of rewards, forging partnerships, and showering its community with gold.  This is the future of community building, degens,  and @kiyosonk is leading the charge!",
        image: "/tweets/omiPost.png",
        link: "https://twitter.com/KIYOSONK/status/1764160434569429095"
    },

    {
        name: "Jerry Jones III",
        username: "@JerryJonesIlI",
        avatar: "/pfp/jerry.jpg",
        content: "I konked out the mud all the way to thruster",
        image: "/tweets/jerry.png",
        link: "https://x.com/JerryJonesIlI/status/1849898617298894871"
    },

    {
        name: "eren 🟢",
        username: "@spicy_aff",
        avatar: "/pfp/eren.jpg",
        content: "Got KONKED last week, time to KONK back",
        image: "/tweets/wasabi.png",
        link: "https://x.com/spicy_aff/status/1853838146972111337"
    },

    {
        name: "PacBot",
        username: "@Pacbotapp",
        avatar: "/pfp/pacbot.jpg",
        content: "Wut is this? 👀🔥",
        image: "/tweets/pacbotSS.png",
        link: "https://x.com/Pacbotapp/status/1850224800062459983"
    },
    // Add more tweets
];

function initKonkermonials() {
    const tweetsTrack = document.querySelector('.tweets-track');
    let isPaused = false;

    function createTweets() {
        tweetsTrack.innerHTML = ''; // Clear existing tweets
        
        // Create two sets of tweets for smooth infinite scroll
        const allTweets = [...tweets, ...tweets]; // Only duplicate once
        
        allTweets.forEach(tweet => {
            const tweetCard = document.createElement('div');
            tweetCard.className = 'tweet-card';
            tweetCard.innerHTML = `
                <div class="tweet-header">
                    <img src="${tweet.avatar}" alt="KONK" class="tweet-avatar">
                    <div class="tweet-user">
                        <div class="tweet-name">${tweet.name}</div>
                        <div class="tweet-username">${tweet.username}</div>
                    </div>
                </div>
                <div class="tweet-content">${tweet.content}</div>
                ${tweet.image ? `<div class="tweet-image-container">
                    <img src="${tweet.image}" alt="Tweet image" class="tweet-image">
                </div>` : ''}
            `;
            
            tweetCard.addEventListener('click', () => {
                window.open(tweet.link, '_blank');
            });

            tweetsTrack.appendChild(tweetCard);
        });

        // Calculate total width
        const totalWidth = tweetsTrack.scrollWidth;
        tweetsTrack.style.width = `${totalWidth}px`;
    }

    function resetAnimation() {
        tweetsTrack.style.animation = 'none';
        tweetsTrack.offsetHeight; // Force reflow
        tweetsTrack.style.animation = `slideLeft ${tweets.length * 10}s linear infinite`; // Adjust speed based on number of tweets
    }

    // Initialize
    createTweets();
    resetAnimation();

    // Pause on hover
    tweetsTrack.addEventListener('mouseenter', () => {
        tweetsTrack.style.animationPlayState = 'paused';
    });

    tweetsTrack.addEventListener('mouseleave', () => {
        tweetsTrack.style.animationPlayState = 'running';
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        createTweets();
        resetAnimation();
    });
}
// Add this to your main JavaScript file
function handleScroll() {
    const mainSection = document.querySelector('.main-section');
    let lastScrollTop = 0;

    mainSection.addEventListener('wheel', (e) => {
        const st = mainSection.scrollTop;
        const mainView = document.querySelector('.main-view');
        const konkmonialsView = document.querySelector('.konkermonials-view');

        if (e.deltaY > 0 && st > lastScrollTop) { // Scrolling down
            mainView.style.transform = 'translateY(-100vh)';
            konkmonialsView.style.transform = 'translateY(-100vh)';
        } else if (e.deltaY < 0 && st < lastScrollTop) { // Scrolling up
            mainView.style.transform = 'translateY(0)';
            konkmonialsView.style.transform = 'translateY(0)';
        }

        lastScrollTop = st <= 0 ? 0 : st;
    });
}

// Update your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    player.init();
    initKonkermonials(); // Initialize the tweets
    handleScroll(); // Add scroll handling
    initRunningKONK();
});
