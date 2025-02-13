document.addEventListener('DOMContentLoaded', function() {
    const book = document.getElementById('book');
    const pageFlipArea = document.getElementById('pageFlipArea');
    const clickableImages = document.querySelectorAll('.clickable-image');

    // Create an audio element
    const audio = new Audio('rkpk.mp3');

    // Function to play audio on first interaction
    function playAudioOnce() {
        audio.play().catch(error => {
            console.log('Playback prevented until user interaction:', error);
        });
        // Remove the event listeners to ensure audio only plays once
        document.removeEventListener('click', playAudioOnce);
        document.removeEventListener('touchend', playAudioOnce);
    }

    // Add event listeners to trigger audio play on first interaction
    document.addEventListener('click', playAudioOnce);
    document.addEventListener('touchend', playAudioOnce);

    function flipBook() {
        book.classList.add('flipped');
        pageFlipArea.style.display = 'none';  // Hide the flip area after flipping
    }

    pageFlipArea.addEventListener('click', flipBook);
    pageFlipArea.addEventListener('touchend', function(e) {
        e.preventDefault();
        flipBook();
    });

    // Prevent default behavior for clickable images
    clickableImages.forEach(img => {
        img.addEventListener('click', function(e) {
            e.stopPropagation();  // Prevent event from bubbling up
        });
        img.addEventListener('touchend', function(e) {
            e.stopPropagation();  // Prevent event from bubbling up
        });
    });

    // Add touch events for mobile devices
    let touchStartX = 0;
    let touchEndX = 0;

    book.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    book.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        if (touchEndX < touchStartX) {
            flipBook();
        }
    }
});
