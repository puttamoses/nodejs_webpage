/* drag.js — HTML5 + Touch drag-and-drop for car cards */
(function () {
  'use strict';

  let dragSrc = null;

  function getCards() {
    return [...document.querySelectorAll('.car-card')];
  }

  /* ---- Desktop HTML5 DnD ---- */
  function onDragStart(e) {
    dragSrc = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
  }
  function onDragEnd() {
    this.classList.remove('dragging');
    getCards().forEach(c => c.classList.remove('drag-over'));
    updateRanks();
  }
  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    getCards().forEach(c => c.classList.remove('drag-over'));
    this.classList.add('drag-over');
  }
  function onDrop(e) {
    e.preventDefault();
    if (dragSrc && dragSrc !== this) {
      const list = this.parentNode;
      const allCards = getCards();
      const srcIdx  = allCards.indexOf(dragSrc);
      const destIdx = allCards.indexOf(this);
      if (srcIdx < destIdx) list.insertBefore(dragSrc, this.nextSibling);
      else                  list.insertBefore(dragSrc, this);
    }
    getCards().forEach(c => c.classList.remove('drag-over'));
    updateRanks();
    incrementMoves();
  }

  /* ---- Touch DnD ---- */
  let touchCard = null, touchClone = null, touchOffX = 0, touchOffY = 0;

  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    touchCard = this;
    const t = e.touches[0];
    const rect = this.getBoundingClientRect();
    touchOffX = t.clientX - rect.left;
    touchOffY = t.clientY - rect.top;
    touchClone = this.cloneNode(true);
    touchClone.style.cssText = `position:fixed;opacity:.7;pointer-events:none;z-index:9999;
      width:${rect.width}px;left:${t.clientX - touchOffX}px;top:${t.clientY - touchOffY}px;`;
    document.body.appendChild(touchClone);
    this.classList.add('dragging');
  }
  function onTouchMove(e) {
    if (!touchCard || e.touches.length !== 1) return;
    e.preventDefault();
    const t = e.touches[0];
    touchClone.style.left = (t.clientX - touchOffX) + 'px';
    touchClone.style.top  = (t.clientY - touchOffY) + 'px';
    getCards().forEach(c => c.classList.remove('drag-over'));
    const el = document.elementFromPoint(t.clientX, t.clientY);
    const target = el && el.closest('.car-card');
    if (target && target !== touchCard) target.classList.add('drag-over');
  }
  function onTouchEnd(e) {
    if (!touchCard) return;
    if (touchClone) { touchClone.remove(); touchClone = null; }
    touchCard.classList.remove('dragging');
    const t = e.changedTouches[0];
    const el = document.elementFromPoint(t.clientX, t.clientY);
    const target = el && el.closest('.car-card');
    if (target && target !== touchCard) {
      const list = target.parentNode;
      const allCards = getCards();
      const srcIdx  = allCards.indexOf(touchCard);
      const destIdx = allCards.indexOf(target);
      if (srcIdx < destIdx) list.insertBefore(touchCard, target.nextSibling);
      else                  list.insertBefore(touchCard, target);
    }
    getCards().forEach(c => c.classList.remove('drag-over'));
    updateRanks();
    incrementMoves();
    touchCard = null;
  }

  /* ---- Helpers ---- */
  function updateRanks() {
    getCards().forEach((c, i) => {
      const rankEl = c.querySelector('.car-rank');
      if (rankEl) rankEl.textContent = i + 1;
    });
  }

  function incrementMoves() {
    const el = document.getElementById('moves-count');
    if (el) el.textContent = parseInt(el.textContent || '0') + 1;
  }

  /* ---- Bind ---- */
  function bindCard(card) {
    card.setAttribute('draggable', 'true');
    card.addEventListener('dragstart',  onDragStart);
    card.addEventListener('dragend',    onDragEnd);
    card.addEventListener('dragover',   onDragOver);
    card.addEventListener('drop',       onDrop);
    card.addEventListener('touchstart', onTouchStart, { passive: true });
    card.addEventListener('touchmove',  onTouchMove,  { passive: false });
    card.addEventListener('touchend',   onTouchEnd);
  }

  document.addEventListener('DOMContentLoaded', () => {
    getCards().forEach(bindCard);
  });

  window.getOrderedIds = function () {
    return getCards().map(c => parseInt(c.dataset.id));
  };
})();
