const API_KEY = "";


const fromLang = document.getElementById("fromLang");
const toLang = document.getElementById("toLang");
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const translateBtn = document.getElementById("translateBtn");
const swapBtn = document.getElementById("swapBtn");
const copyBtn = document.getElementById("copyBtn");
const voiceBtn = document.getElementById("voiceBtn");
const speakBtn = document.getElementById("speakBtn");
const loading = document.getElementById("loading");
const historyList = document.getElementById("historyList");
const themeToggle = document.getElementById("themeToggle");

const languages = {
    "Auto Detect": "auto",
    "English": "en",
    "Hindi": "hi",
    "Marathi": "mr",
    "Gujarati": "gu",
    "Tamil": "ta",
    "Telugu": "te",
    "Kannada": "kn",
    "Malayalam": "ml",
    "Punjabi": "pa",
    "Bengali": "bn",
    "Urdu": "ur",
    "Spanish": "es",
    "French": "fr",
    "German": "de",
    "Chinese": "zh",
    "Japanese": "ja",
    "Arabic": "ar"
};

for (let lang in languages) {
    fromLang.innerHTML += `<option value="${languages[lang]}">${lang}</option>`;
    toLang.innerHTML += `<option value="${languages[lang]}">${lang}</option>`;
}

toLang.value = "hi";

// Dark mode toggle
themeToggle.onclick = () => {
    document.body.classList.toggle("dark");
};

// Swap
swapBtn.onclick = () => {
    [fromLang.value, toLang.value] = [toLang.value, fromLang.value];
};

// Copy
copyBtn.onclick = () => {
    navigator.clipboard.writeText(outputText.value);
    alert("Copied!");
};

// Voice input
voiceBtn.onclick = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = fromLang.value === "auto" ? "en-US" : fromLang.value;
    recognition.start();
    recognition.onresult = (event) => {
        inputText.value = event.results[0][0].transcript;
    };
};

// Speak output
speakBtn.onclick = () => {
    const speech = new SpeechSynthesisUtterance(outputText.value);
    speech.lang = toLang.value;
    window.speechSynthesis.speak(speech);
};

// History
let history = JSON.parse(localStorage.getItem("translationHistory")) || [];

function saveHistory(input, output) {
    history.unshift(`${input} → ${output}`);
    if (history.length > 10) history.pop();
    localStorage.setItem("translationHistory", JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = "";
    history.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        historyList.appendChild(li);
    });
}

renderHistory();

// Translate
translateBtn.onclick = async () => {

    if (!inputText.value.trim()) {
        alert("Enter text!");
        return;
    }

    loading.style.display = "block";
    outputText.value = "";

    const prompt = `Translate this text to ${toLang.options[toLang.selectedIndex].text}: ${inputText.value}`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            }
        );

        const data = await response.json();
        const translated = data.candidates[0].content.parts[0].text;

        outputText.value = translated;
        saveHistory(inputText.value, translated);

    } catch (error) {
        outputText.value = "Error translating.";
        console.error(error);
    }

    loading.style.display = "none";
};
