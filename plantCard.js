const plantDescriptions = {
  'salal': "The single best ground cover for northwest gardens, salal is a do it all plant. It will also grow where almost nothing else will.",
  'dogwood': "For best gardening effect, prune these an inch above ground in the early spring as the red begins to darken and just before new buds begin to appear.",
  'camas': "Perennial groundcover with beautiful spikes of bluish purple flower clusters. Spring blooming."
};
const citation = "Source: King County Native Plant Guide";

function drawPlantCard(x, y, plantName, plantImage) {
  const cardWidth = 300;
  const cardHeight = 400;
  const padding = 20;
  const imagePadding = 10;

  push();

  // Card background
  fill(250);
  stroke(180);
  strokeWeight(2);
  rect(x, y, cardWidth, cardHeight, 12);

  // Plant image
  let drawW, drawH;
  if (plantImage) {
    const maxW = cardWidth - (padding + imagePadding) * 2;
    const maxH = plantImage.height;
  
    const imgAspect = plantImage.width / plantImage.height;
    const boxAspect = maxW / maxH;
  
    if (imgAspect > boxAspect) {
      // Width-limited
      drawW = maxW;
      drawH = drawW / imgAspect;
    } else {
      // Height-limited
      drawH = maxH;
      drawW = drawH * imgAspect;
    }
  
    // Center image horizontally in image area
    const imgX = x + (padding + imagePadding) + (maxW - drawW) / 2;
    const imgY = y + (padding + imagePadding);
  
    image(plantImage, imgX, imgY, drawW, drawH);
  }

  // Plant name
  fill(30);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(40);
  textStyle(BOLD);

  const titleY = y + (padding + imagePadding) + drawH + imagePadding;

  text(
    plantName,
    x + padding,
    titleY
  );

  // Description (optional)
  textSize(16);
  textStyle(NORMAL);
  fill(60);
  text(
    plantDescriptions[plantName],
    x + padding,
    titleY + 35 + imagePadding,
    cardWidth - padding * 2,
    cardHeight - drawH - 70
  );
  
  textSize(10);
  textStyle(BOLD);
  text(
    citation,
    x + padding,
    y + cardHeight - padding - 10,
    cardWidth - padding * 2,
    10
  )

  pop();
}