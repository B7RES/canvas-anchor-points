const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const img = new Image();
img.src = "https://www.svgrepo.com/show/10863/octagon-outline-shape.svg";

const anchorSize = 8;
const anchorColor = "#0066ff";
const borderColor = "#000000";
const borderWidth = 2;

let imageX;
let imageY;
let imageWidth;
let imageHeight;
let originalWidth;
let originalHeight;
let isDragging = false;
let selectedAnchor = -1;
let oldWidth;
let oldHeight;

let isResizingBorder = false;
let selectedBorder = -1; // 0: top, 1: right, 2: bottom, 3: left

function drawAnchorPoints(x, y, width, height) {
  const anchors = [
    { x: x, y: y },
    { x: x + width / 2, y: y },
    { x: x + width, y: y },
    { x: x + width, y: y + height / 2 },
    { x: x + width, y: y + height },
    { x: x + width / 2, y: y + height },
    { x: x, y: y + height },
    { x: x, y: y + height / 2 },
  ];

  anchors.forEach((anchor, index) => {
    ctx.fillStyle = index === selectedAnchor ? "#ff0000" : anchorColor;
    ctx.fillRect(
      anchor.x - anchorSize / 2,
      anchor.y - anchorSize / 2,
      anchorSize,
      anchorSize
    );
  });
  return anchors;
}

function hitBorder(x, y) {
  const borderHitArea = 8;

  // controllo top border
  if (
    y >= imageY - borderHitArea / 2 &&
    y <= imageY + borderHitArea / 2 &&
    x >= imageX &&
    x <= imageX + imageWidth
  ) {
    return 0;
  }
  // controllo right border
  if (
    x >= imageX + imageWidth - borderHitArea / 2 &&
    x <= imageX + imageWidth + borderHitArea / 2 &&
    y >= imageY &&
    y <= imageY + imageHeight
  ) {
    return 1;
  }
  // controllo bottom border
  if (
    y >= imageY + imageHeight - borderHitArea / 2 &&
    y <= imageY + imageHeight + borderHitArea / 2 &&
    x >= imageX &&
    x <= imageX + imageWidth
  ) {
    return 2;
  }
  // controll left border
  if (
    x >= imageX - borderHitArea / 2 &&
    x <= imageX + borderHitArea / 2 &&
    y >= imageY &&
    y <= imageY + imageHeight
  ) {
    return 3;
  }
  return -1;
}

function getAnchors() {
  return [
    { x: imageX, y: imageY },
    { x: imageX + imageWidth / 2, y: imageY },
    { x: imageX + imageWidth, y: imageY },
    { x: imageX + imageWidth, y: imageY + imageHeight / 2 },
    { x: imageX + imageWidth, y: imageY + imageHeight },
    { x: imageX + imageWidth / 2, y: imageY + imageHeight },
    { x: imageX, y: imageY + imageHeight },
    { x: imageX, y: imageY + imageHeight / 2 },
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
    if (
      x >= anchor.x - anchorSize / 2 &&
      x <= anchor.x + anchorSize / 2 &&
      y >= anchor.y - anchorSize / 2 &&
      y <= anchor.y + anchorSize / 2
    ) {
      return i;
    }
  }
  return -1;
}

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  selectedAnchor = hitAnchor(x, y);
  selectedBorder = hitBorder(x, y);

  if (selectedAnchor !== -1) {
    isDragging = true;
    oldWidth = imageWidth;
    oldHeight = imageHeight;
  } else if (selectedBorder !== -1) {
    isResizingBorder = true;
    oldWidth = imageWidth;
    oldHeight = imageHeight;
  }
});

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const aspectRatio = img.width / img.height;

  updateCursor(x, y);

  if (isDragging && selectedAnchor !== -1) {
    const centerY = imageY + imageHeight / 2;
    switch (selectedAnchor) {
      case 0: // Top-left
        const oldRight = imageX + imageWidth;
        const oldBottom = imageY + imageHeight;
        imageWidth = oldRight - x;
        imageHeight = imageWidth / aspectRatio;
        imageX = x;
        imageY = oldBottom - imageHeight;
        break;
      case 1: // Top-middle
        const centerX = imageX + imageWidth / 2;
        imageHeight = imageY + imageHeight - y;
        imageWidth = imageHeight * aspectRatio;
        imageX = centerX - imageWidth / 2;
        imageY = y;
        break;
      case 2: // Top-right
        const oldLeft = imageX;
        const oldBottom2 = imageY + imageHeight;
        imageWidth = x - oldLeft;
        imageHeight = imageWidth / aspectRatio;
        imageX = oldLeft;
        imageY = oldBottom2 - imageHeight;
        break;
      case 3: // Middle-right
        const fixedLeft = imageX;
        imageWidth = x - fixedLeft;
        imageHeight = imageWidth / aspectRatio;
        imageX = fixedLeft;
        imageY = centerY - imageHeight / 2;
        break;
      case 4: // Bottom-right
        imageWidth = x - imageX;
        imageHeight = imageWidth / aspectRatio;
        break;
      case 5: // Bottom-middle
        const centerX2 = imageX + imageWidth / 2;
        imageHeight = y - imageY;
        imageWidth = imageHeight * aspectRatio;
        imageX = centerX2 - imageWidth / 2;
        break;
      case 6: // Bottom-left
        const oldRight2 = imageX + imageWidth;
        imageWidth = oldRight2 - x;
        imageHeight = imageWidth / aspectRatio;
        imageX = x;
        break;
      case 7: // Middle-left
        const fixedRight = imageX + imageWidth;
        imageWidth = fixedRight - x;
        imageHeight = imageWidth / aspectRatio;
        imageX = fixedRight - imageWidth;
        imageY = centerY - imageHeight / 2;
        break;
    }
    draw();
  } else if (isResizingBorder && selectedBorder !== -1) {
    const centerX = imageX + imageWidth / 2;
    switch (selectedBorder) {
      case 0: // Top border
        const heightFromTop = imageY + imageHeight - y;
        imageHeight = heightFromTop;
        imageWidth = imageHeight * aspectRatio;
        imageX = centerX - imageWidth / 2;
        imageY = y;
        break;
      case 1: // Right border
        imageWidth = x - imageX;
        imageHeight = imageWidth / aspectRatio;
        break;
      case 2: // Bottom border
        imageHeight = y - imageY;
        imageWidth = imageHeight * aspectRatio;
        imageX = centerX - imageWidth / 2;
        break;
      case 3: // Left border
        const fixedRight = imageX + imageWidth;
        imageWidth = fixedRight - x;
        imageHeight = imageWidth / aspectRatio;
        imageX = x;
        break;
    }
    draw();
  }
});

function updateCursor(x, y) {
  canvas.classList.remove(
    "n-resize",
    "ne-resize",
    "e-resize",
    "se-resize",
    "s-resize",
    "sw-resize",
    "w-resize",
    "nw-resize"
  );

  const anchor = hitAnchor(x, y);
  const border = hitBorder(x, y);

  if (anchor !== -1) {
    const cursorMap = {
      0: "nw",
      1: "n",
      2: "ne",
      3: "e",
      4: "se",
      5: "s",
      6: "sw",
      7: "w",
    };
    canvas.classList.add(`${cursorMap[anchor]}-resize`);
  } else if (border !== -1) {
    const cursorMap = {
      0: "n",
      1: "e",
      2: "s",
      3: "w",
    };
    canvas.classList.add(`${cursorMap[border]}-resize`);
  }
}

canvas.addEventListener("mouseup", () => {
  isDragging = false;
  isResizingBorder = false;
  selectedAnchor = -1;
  selectedBorder = -1;
  canvas.classList.remove(
    "n-resize",
    "ne-resize",
    "e-resize",
    "se-resize",
    "s-resize",
    "sw-resize",
    "w-resize",
    "nw-resize"
  );
  draw();
});

img.onload = function () {
  imageX = (canvas.width - img.width) / 2;
  imageY = (canvas.height - img.height) / 2;
  imageWidth = img.width;
  imageHeight = img.height;
  originalWidth = img.width;
  originalHeight = img.height;
  draw();
};
