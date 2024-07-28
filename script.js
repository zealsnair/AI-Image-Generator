// Handling the initial image loading at startup
document.addEventListener('DOMContentLoaded', function() {
    const images = [
        'images/Img-1.jpeg', 'images/Img-2.jpeg', 'images/Img-3.jpeg', 'images/Img-4.jpeg',
        'images/Img-5.jpeg', 'images/Img-6.jpeg', 'images/Img-7.jpeg', 'images/Img-8.jpeg',
        'images/Img-9.jpeg', 'images/Img-10.jpeg', 'images/Img-11.jpeg', 'images/Img-12.jpeg'
    ];

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    shuffleArray(images);

    for (let i = 1; i <= 4; i++) {
        const imgElement = document.getElementById('img' + i);
        imgElement.src = images[i - 1];
        const downloadBtn = imgElement.nextElementSibling;
        downloadBtn.href = images[i - 1];
    }

    function updatePlaceholder() {
        var inputField = document.getElementById('prompt-input');
        if (window.innerWidth < 375) {
            inputField.placeholder = 'Enter details';
        } else if (window.innerWidth >= 375 && window.innerWidth < 768) {
            inputField.placeholder = 'Describe Image';
        } else {
            inputField.placeholder = 'Try Something like "Panda playing cricket in white clothes"';
        }
    }

    updatePlaceholder();
    window.onresize = updatePlaceholder;
});

//API CALLING
const token = "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";
const inputTxt = document.getElementById("prompt-input");
const button = document.getElementById("generate-btn");
const imageIds = ['img1', 'img2', 'img3', 'img4'];

async function query(promptText) {
    const data = {
        inputs: promptText
    };

    const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }
    );

    if (!response.ok) {
        const message = `An error has occurred: ${response.status}`;
        throw new Error(message);
    }

    const result = await response.blob();
    return result;
}

button.addEventListener('click', async function (event) {
    event.preventDefault();
    const userInput = inputTxt.value;
    if (userInput.trim() === '') {
        alert('Please enter some text to generate images.');
        return;
    }

    const loadingOverlays = document.querySelectorAll('.loading-overlay');
    loadingOverlays.forEach(overlay => overlay.style.display = 'flex');

    const imagePromises = imageIds.map(() => query(userInput));

    try {
        const responses = await Promise.all(imagePromises);
        responses.forEach((response, index) => {
            const imgElement = document.getElementById(imageIds[index]);
            const objectURL = URL.createObjectURL(response);
            imgElement.src = objectURL;
            const downloadBtn = imgElement.nextElementSibling;
            downloadBtn.href = objectURL;
            const filename = `Generated_Img_${index + 1}.jpg`; 
            downloadBtn.setAttribute('download', filename);
        });
    } catch (error) {
        console.error('Failed to fetch images:', error);
        alert('Failed to generate images. Please try again later.');
    }
    finally {
        loadingOverlays.forEach(overlay => overlay.style.display = 'none');
    }
});

inputTxt.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        button.classList.add('active-state');  
        setTimeout(() => {  // Remove active state after a short delay
        button.classList.remove('active-state');}, 150); 
        button.click();         
    }
});
