const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const img = new Image();
img.src = 'https://www.svgrepo.com/show/10863/octagon-outline-shape.svg';

const anchorSize = 8;
const anchorColor = '#0066ff';
const borderColor = '#000000';
const borderWidth = 2;

let imageX;
let imageY;
let imageWidth;
let imageHeight;
let isDragging = false;
let selectedAnchor = -1;

function drawAnchorPoints(x, y, width, height) {
    const anchors = [
        { x: x, y: y },
        { x: x + width/2, y: y },
        { x: x + width, y: y },
        { x: x + width, y: y + height/2 },
        { x: x + width, y: y + height },
        { x: x + width/2, y: y + height },
        { x: x, y: y + height },
        { x: x, y: y + height/2 }
    ];

    anchors.forEach((anchor, index) => {
        ctx.fillStyle = index === selectedAnchor ? '#ff0000' : anchorColor;
        ctx.fillRect(
            anchor.x - anchorSize/2,
            anchor.y - anchorSize/2,
            anchorSize,
            anchorSize
        );
    });
    return anchors;
}

function getAnchors() {
    return [
        { x: imageX, y: imageY },
        { x: imageX + imageWidth/2, y: imageY },
        { x: imageX + imageWidth, y: imageY },
        { x: imageX + imageWidth, y: imageY + imageHeight/2 },
        { x: imageX + imageWidth, y: imageY + imageHeight },
        { x: imageX + imageWidth/2, y: imageY + imageHeight },
        { x: imageX, y: imageY + imageHeight },
        { x: imageX, y: imageY + imageHeight/2 }
    ];
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, imageX, imageY, imageWidth, imageHeight);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(imageX, imageY, imageWidth, imageHeight);
    drawAnchorPoints(imageX, imageY, imageWidth, imageHeight);
}

function hitAnchor(x, y) {
    const anchors = getAnchors();
    for (let i = 0; i < anchors.length; i++) {
        const anchor = anchors[i];
        if (x >= anchor.x - anchorSize/2 && 
            x <= anchor.x + anchorSize/2 && 
            y >= anchor.y - anchorSize/2 && 
            y <= anchor.y + anchorSize/2) {
            return i;
        }
    }
    return -1;
}

canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    selectedAnchor = hitAnchor(x, y);
    if (selectedAnchor !== -1) {
        isDragging = true;
    }
});

canvas.addEventListener('mousemove', e => {
    if (isDragging && selectedAnchor !== -1) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const aspectRatio = img.width / img.height;

        switch(selectedAnchor) {
            case 0: // Top-left
                const widthChangeTopLeft = imageX - x;
                imageWidth += widthChangeTopLeft;
                imageHeight = imageWidth / aspectRatio;
                imageX = x;
                imageY = imageY + (imageHeight - (imageWidth / aspectRatio));
                break;
            case 1: // Top-middle
                const heightChangeTop = imageY - y;
                imageHeight += heightChangeTop;
                imageWidth = imageHeight * aspectRatio;
                imageX = imageX - (imageWidth - (imageHeight * aspectRatio)) / 2;
                imageY = y;
                break;
            case 2: // Top-right
                imageWidth = x - imageX;
                imageHeight = imageWidth / aspectRatio;
                imageY = imageY + (imageHeight - (imageWidth / aspectRatio));
                break;
            case 3: // Middle-right
                imageWidth = x - imageX;
                imageHeight = imageWidth / aspectRatio;
                imageY = imageY - (imageHeight - (imageWidth / aspectRatio)) / 2;
                break;
            case 4: // Bottom-right
                imageWidth = x - imageX;
                imageHeight = imageWidth / aspectRatio;
                break;
            case 5: // Bottom-middle
                imageHeight = y - imageY;
                imageWidth = imageHeight * aspectRatio;
                imageX = imageX - (imageWidth - (imageHeight * aspectRatio)) / 2;
                break;
            case 6: // Bottom-left
                const widthChangeBottomLeft = imageX - x;
                imageWidth += widthChangeBottomLeft;
                imageHeight = imageWidth / aspectRatio;
                imageX = x;
                break;
            case 7: // Middle-left
                const widthChangeLeft = imageX - x;
                imageWidth += widthChangeLeft;
                imageHeight = imageWidth / aspectRatio;
                imageX = x;
                imageY = imageY - (imageHeight - (imageWidth / aspectRatio)) / 2;
                break;
        }
        draw();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    selectedAnchor = -1;
    draw();
});

img.onload = function() {
    imageX = (canvas.width - img.width) / 2;
    imageY = (canvas.height - img.height) / 2;
    imageWidth = img.width;
    imageHeight = img.height;
    draw();
};