function weightedRandom() {
  let roll = Math.random() * 100;
  let sum = 0;
  for (let r of rarities) {
    sum += r.chance;
    if (roll <= sum) return r.name;
  }
}

function drawCard() {
  let rarity = weightedRandom();
  let cardsOfRarity = allCards.filter(c => c.rarity === rarity);
  let card = {...cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)]};

  // Qualität 1–5 Sterne
  let qRoll = Math.random() * 100;
  if (qRoll <= 50) card.quality = Math.floor(Math.random() * 2) + 1;
  else if (qRoll <= 80) card.quality = 3;
  else if (qRoll <= 95) card.quality = 4;
  else card.quality = 5;

  inventory.push(card);
  showCurrentCard(card);
  renderInventory();
}

function showCurrentCard(card) {
  const div = document.getElementById('currentCard');
  let stars = '✦'.repeat(card.quality);
  div.innerHTML = `
    <div class="card ${card.rarity.toLowerCase()}">
      <div class="rarity">${card.rarity}</div>
      <div class="name">${card.name}</div>
      <div class="icon">${card.icon}</div>
      <div class="stars">${stars}</div>
    </div>`;
}

function renderInventory() {
  const inv = document.getElementById('inventory');
  inv.innerHTML = '';
  inventory.forEach(c => {
    const d = document.createElement('div');
    d.className = `small-card ${c.rarity.toLowerCase()}`;
    let stars = '✦'.repeat(c.quality);
    d.innerHTML = `<div class="icon">${c.icon}</div><div class="name">${c.name}</div><div class="stars">${stars}</div>`;
    inv.appendChild(d);
  });
}
