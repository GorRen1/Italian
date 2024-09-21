let flashcards = [];
let filteredFlashcards = [];
let currentIndex = 0;
let correctCount = 0;
let currentSet = 'Words1'; // Default set selection
let showRemoveDialog = true; // Flag to control showing the remove dialog

// Function to filter flashcards based on the current set (case-insensitive comparison)
function filterFlashcards() {
    console.log('Filtering for set:', currentSet); // Debugging output
    filteredFlashcards = flashcards.filter(card => {
        console.log(`Card Set: ${card.set}, Remove: ${card.removePhrase}`); // Debugging each card
        return card.set.toLowerCase() === currentSet.toLowerCase() && !card.removePhrase;
    });
    correctCount = filteredFlashcards.filter(card => card.correctGuess).length;
    console.log('Filtered flashcards:', filteredFlashcards); // Debugging output
}

// Function to update and display the current card
function updateCard() {
    if (filteredFlashcards.length === 0) {
        document.getElementById('message').innerText = 'No flashcards loaded or filtered for the selected set.';
        return;
    }
    const card = filteredFlashcards[currentIndex];
    document.getElementById('italian').innerText = card.italian;
    document.getElementById('english').innerText = card.english;
    document.getElementById('correctGuess').checked = card.correctGuess || false;
    document.getElementById('removePhrase').checked = card.removePhrase || false;
    document.getElementById('progress').innerText = `Progress: ${correctCount}`;

    // Hide English text initially when a new card is shown
    document.getElementById('english').style.display = 'none';

    // Update the Back button status
    updateBackButtonStatus();
}

// Function to clear the message
function clearMessage() {
    document.getElementById('message').innerText = '';
}

// Function to update the Back button status
function updateBackButtonStatus() {
    const backButton = document.getElementById('back');
    // Disable the back button if we're at the first available card
    if (currentIndex === 0 || filteredFlashcards.length === 0) {
        backButton.disabled = true;
    } else {
        backButton.disabled = false;
    }
}

// Function to show the remove dialog
function showRemoveConfirmation() {
    if (showRemoveDialog) {
        document.getElementById('removeDialog').style.display = 'block';
    } else {
        removeCurrentCard();
    }
}

// Function to hide the remove dialog
function hideRemoveConfirmation() {
    document.getElementById('removeDialog').style.display = 'none';
}

// Function to remove the current card
function removeCurrentCard() {
    if (filteredFlashcards.length > 0) {
        filteredFlashcards[currentIndex].removePhrase = true;
        filterFlashcards();
        if (currentIndex >= filteredFlashcards.length) {
            currentIndex = Math.max(0, filteredFlashcards.length - 1);
        }
        updateCard();
    }
}

// Function to show the reset dialog
function showResetConfirmation() {
    document.getElementById('resetDialog').style.display = 'block';
}

// Function to hide the reset dialog
function hideResetConfirmation() {
    document.getElementById('resetDialog').style.display = 'none';
}

// Function to reset all cards
function resetAllCards() {
    currentIndex = 0;
    correctCount = 0;
    flashcards.forEach(card => {
        card.correctGuess = false;
        card.removePhrase = false;
    });
    filterFlashcards();
    updateCard();
    clearMessage();
}

// Fetch the JSON data from the external file
function loadFlashcards() {
    fetch('data/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Data successfully loaded:', data); // Debugging output for data
            flashcards = data;

            // Ensure the data contains the expected fields (debugging)
            if (flashcards.length > 0) {
                console.log('First card structure:', flashcards[0]); // Debug first card structure
                filterFlashcards();  // Filter the flashcards based on the current set
                updateCard();  // Initialize the first card after loading data
            } else {
                document.getElementById('message').innerText = 'No flashcards available.';
            }
        })
        .catch(error => {
            console.error('Error loading the data: ', error);
            document.getElementById('message').innerText = 'Error loading flashcard data.';
        });
}

// Event listener setup
function setupEventListeners() {
    document.getElementById('showEnglish').addEventListener('click', () => {
        document.getElementById('english').style.display = 'block';
        clearMessage();
    });

    document.getElementById('next').addEventListener('click', () => {
        if (filteredFlashcards.length > 0 && currentIndex < filteredFlashcards.length - 1) {
            currentIndex++;
            updateCard();
            clearMessage();
        }
    });

    document.getElementById('back').addEventListener('click', () => {
        if (filteredFlashcards.length > 0 && currentIndex > 0) {
            let foundPrevious = false;
            for (let i = currentIndex - 1; i >= 0; i--) {
                if (!filteredFlashcards[i].removePhrase) {
                    currentIndex = i;
                    foundPrevious = true;
                    break;
                }
            }
            if (foundPrevious) {
                updateCard();
                clearMessage();
            }
        }
    });

    document.getElementById('random').addEventListener('click', () => {
        const availableCards = filteredFlashcards.filter(card => !card.correctGuess && !card.removePhrase);

        if (availableCards.length > 0) {
            const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
            currentIndex = filteredFlashcards.findIndex(card => card.italian === randomCard.italian && card.english === randomCard.english);
            updateCard();
            clearMessage();
        } else {
            document.getElementById('message').innerText = 'No available flashcards to show (all are marked correct or removed).';
        }
    });

    document.getElementById('reset').addEventListener('click', showResetConfirmation);

    document.getElementById('correctGuess').addEventListener('change', (event) => {
        if (filteredFlashcards.length > 0) {
            filteredFlashcards[currentIndex].correctGuess = event.target.checked;
            correctCount = filteredFlashcards.filter(card => card.correctGuess).length;
            document.getElementById('progress').innerText = `Progress: ${correctCount}`;
            clearMessage();
        }
    });

    document.getElementById('removePhrase').addEventListener('change', (event) => {
        if (event.target.checked) {
            showRemoveConfirmation();
        } else {
            if (filteredFlashcards.length > 0) {
                filteredFlashcards[currentIndex].removePhrase = false;
                updateCard();
                clearMessage();
            }
        }
    });

    document.getElementById('showFirstCorrect').addEventListener('click', () => {
        const firstCorrect = filteredFlashcards.findIndex(card => card.correctGuess);
        if (firstCorrect !== -1) {
            currentIndex = firstCorrect;
            updateCard();
        } else {
            document.getElementById('message').innerText = 'No correct answers yet.';
        }
    });

    document.getElementById('nextCorrect').addEventListener('click', () => {
        const nextCorrect = filteredFlashcards.slice(currentIndex + 1).findIndex(card => card.correctGuess);
        if (nextCorrect !== -1) {
            currentIndex = currentIndex + nextCorrect + 1;
            updateCard();
        } else {
            document.getElementById('message').innerText = 'No more correct answers.';
        }
    });

    document.querySelectorAll('input[name="set"]').forEach(radio => {
        radio.addEventListener('change', (event) => {
            currentSet = event.target.value;
            currentIndex = 0;
            filterFlashcards();
            updateCard();
            clearMessage();
        });
    });

    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', clearMessage);
    });

    // Remove dialog event listeners
    document.getElementById('removeContinue').addEventListener('click', () => {
        removeCurrentCard();
        hideRemoveConfirmation();
    });

    document.getElementById('removeCancel').addEventListener('click', () => {
        document.getElementById('removePhrase').checked = false;
        hideRemoveConfirmation();
    });

    document.getElementById('removeConfirm').addEventListener('change', (event) => {
        showRemoveDialog = !event.target.checked;
    });

    // Reset dialog event listeners
    document.getElementById('resetYes').addEventListener('click', () => {
        resetAllCards();
        hideResetConfirmation();
    });

    document.getElementById('resetNo').addEventListener('click', hideResetConfirmation);
}

// Initialize the app
function init() {
    loadFlashcards();
    setupEventListeners();
}

// Call init when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);a