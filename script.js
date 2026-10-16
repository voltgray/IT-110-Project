const wordInput = document.getElementById('word-input'); // Get text input element
const searchBtn = document.getElementById('search-btn'); // Get search button element
const resultContainer = document.getElementById('result-container'); // Get container for results

async function fetchDictionaryData(word) {
    const cleanWord = word.toLowerCase().trim();
    if (!cleanWord) return;
    
    // 1. Check network connection first
if (!navigator.onLine) {
        resultContainer.innerHTML = `
            <div class="error-box" style="padding: 15px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 12px; color: #dc2626; text-align: center; margin-top: 20px;">
                <p><strong>Error:</strong> No internet connection. Please check your network and try again.</p>
            </div>
        `;
        return;
    }

    // 2. disabling the inputs during search
    setLoadingState(true);
    resultContainer.innerHTML = `<p class="loading">Searching...</p>`;

    try {
        const apiUrl = `https://api.datamuse.com/words?sp=${cleanWord}&md=d`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Server error: Status ${response.status}`);
        }

        const data = await response.json();
        
        // Check if Datamuse returned valid definitions
        if (!data || data.length === 0 || !data[0].defs) {
            throw new Error("Word not found");
        }

        displayResult(data[0]);

    } catch (error) {
        console.error("Error:", error);
        // 3. Display the detailed error directly on the webpage interface
        resultContainer.innerHTML = `
            <div class="error-box" style="padding: 15px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 12px; color: #dc2626; text-align: center; margin-top: 20px;">
                <p> ${error}</p>
            </div>
        `;
    } finally {
        // Re-enable inputs after search completes
        setLoadingState(false);
    }
}

function setLoadingState(isLoading) {
    if (wordInput && searchBtn) {
        wordInput.disabled = isLoading;
        searchBtn.disabled = isLoading;
        searchBtn.style.opacity = isLoading ? '0.6' : '1';
        searchBtn.style.cursor = isLoading ? 'not-allowed' : 'pointer';
    }
}

function displayResult(data) {
    const word = data.word;

    const posGroups = {};
    data.defs.forEach(defStr => {
        const parts = defStr.split('\t');
        const pos = parts[0] || 'definition';
        const definition = parts[1] || defStr;
        
        if (!posGroups[pos]) {
            posGroups[pos] = [];
        }
        posGroups[pos].push(definition);
    });

    let meaningsHTML = '';
    for (const [pos, defs] of Object.entries(posGroups)) {
        let definitionsHTML = '';
        defs.forEach(def => {
            definitionsHTML += `
                <div class="definition-box">
                    <p class="meaning">${def}</p>
                </div>`;
        });

        meaningsHTML += `
            <div class="meaning-group">
                <span class="pos-tag">${pos}</span>
                ${definitionsHTML}
            </div>
        `;
    }

    resultContainer.innerHTML = `
        <div class="word-header">
            <h2 class="word-title">${word}</h2>
        </div>
        <div class="meanings-container">
            ${meaningsHTML}
        </div>
    `;
}

// Event Listener for Search Button Click
if (searchBtn && wordInput) {
    searchBtn.addEventListener('click', () => {
        fetchDictionaryData(wordInput.value);
    });

    // Event Listener for Enter Key
    wordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            fetchDictionaryData(wordInput.value);
        }
    });
}