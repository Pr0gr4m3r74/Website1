function showCurrentCard(card) {
  const div = document.getElementById('currentCard');
  let stars = '✦'.repeat(card.quality); // Sterne für Reinheit
  div.innerHTML = `
    <div class="card ${card.class}">
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
    d.className = `small-card ${c.class}`;
    let stars = '✦'.repeat(c.quality);
    d.innerHTML = `<div class="icon">${c.icon}</div>
                   <div class="name">${c.name}</div>
                   <div class="stars">${stars}</div>`;
    inv.appendChild(d);
  });
}
