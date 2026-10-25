const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const toast = $("#toast");
let toastTimeout;
function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2800);
}
const cart = [];
const money = value => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function renderCart() {
  $("#cart-count").textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  const items = $("#cart-items");
  items.replaceChildren();
  if (!cart.length) {
    const p = document.createElement("p");
    p.textContent = "Seu carrinho está vazio.";
    items.append(p);
  } else {
    cart.forEach(item => {
      const row = document.createElement("div");
      row.className = "cart-line";
      const label = document.createElement("span");
      label.textContent = `${item.name} × ${item.qty} — ${money(item.price * item.qty)}`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remover";
      remove.setAttribute("aria-label", `Remover ${item.name} do carrinho`);
      remove.addEventListener("click", () => {
        const index = cart.findIndex(p => p.name === item.name);
        if (index >= 0) {
          if (cart[index].qty > 1) cart[index].qty--;
          else cart.splice(index, 1);
        }
        renderCart();
      });
      row.append(label, remove);
      items.append(row);
    });
  }
  $("#cart-total").textContent = `Total: ${money(cart.reduce((sum, item) => sum + item.price * item.qty, 0))}`;
}
function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) existing.qty++;
  else cart.push({ name, price, qty: 1 });
  renderCart();
  notify(`${name} adicionado ao carrinho.`);
}
$$("[data-add]").forEach(button => button.addEventListener("click", () => addToCart(button.dataset.add, Number(button.dataset.price))));

const detailsDialog = $("#details-dialog");
let selectedDetail = null;
$$("[data-details]").forEach(button => button.addEventListener("click", () => {
  const [name, color, fabric, description, price] = button.dataset.details.split("|");
  selectedDetail = { name, price: Number(button.closest(".product-card").dataset.price) };
  $("#dialog-title").textContent = name;
  const dl = $("#dialog-content");
  dl.replaceChildren();
  [["Cor", color], ["Tecido", fabric], ["Descrição", description], ["Preço", price]].forEach(([term, value]) => {
    const dt = document.createElement("dt"); dt.textContent = term;
    const dd = document.createElement("dd"); dd.textContent = value;
    dl.append(dt, dd);
  });
  detailsDialog.showModal();
}));
$("#dialog-add").addEventListener("click", () => {
  if (selectedDetail) addToCart(selectedDetail.name, selectedDetail.price);
  detailsDialog.close();
});
$$(".dialog-close").forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));
$("#cart-open").addEventListener("click", () => { renderCart(); $("#cart-dialog").showModal(); });
$("#continue-shopping").addEventListener("click", () => $("#cart-dialog").close());
$("#account-button").addEventListener("click", () => notify("A área Minha conta estará disponível em uma próxima etapa."));

const searchInput = $("#search-input");
function filterProducts(query) {
  const normalized = query.trim().toLocaleLowerCase("pt-BR");
  let visible = 0;
  $$(".product-card").forEach(card => {
    const match = `${card.dataset.name} ${card.dataset.category} ${card.textContent}`.toLocaleLowerCase("pt-BR").includes(normalized);
    card.hidden = !match;
    if (match) visible++;
  });
  $("#empty-state").hidden = visible !== 0;
  $("#results-message").textContent = normalized ? `${visible} ${visible === 1 ? "produto encontrado" : "produtos encontrados"} para “${query.trim()}”.` : "";
}
$("#search-form").addEventListener("submit", event => {
  event.preventDefault();
  filterProducts(searchInput.value);
  $("#produtos").scrollIntoView({ behavior: "smooth" });
});
searchInput.addEventListener("input", () => { if (!searchInput.value.trim()) filterProducts(""); });
$$("[data-category]").forEach(link => link.addEventListener("click", () => {
  searchInput.value = link.dataset.category;
  filterProducts(link.dataset.category);
}));
$("#menu-toggle").addEventListener("click", () => {
  const nav = $("#mobile-nav");
  const expanded = $("#menu-toggle").getAttribute("aria-expanded") === "true";
  $("#menu-toggle").setAttribute("aria-expanded", String(!expanded));
  nav.hidden = expanded;
});
renderCart();
