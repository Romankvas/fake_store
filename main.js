let card = JSON.parse(localStorage.getItem('card')) || [];
updateCartCount();

function updateCartCount() {
  let total = card.reduce((sum, p) => sum + p.quantity, 0);
  $('.cardCount').text(total);
}

function saveCart() {
  localStorage.setItem('card', JSON.stringify(card));
  updateCartCount();
}

function loadProducts() {
  axios.get('https://fakestoreapi.com/products').then(res => {
    displayProducts(res.data);
  });
}

function displayProducts(products) {
  const sort = $('#sort').val();
  if (sort === 'asc') products.sort((a, b) => a.price - b.price);
  if (sort === 'desc') products.sort((a, b) => b.price - a.price);

  $('.productContainer').empty();
  for (let el of products) {
    $('.productContainer').append(`
      <div class="product">
        <h4>${el.title}</h4>
        <div class="picture"><img src="${el.image}" alt="image"></div>
        <p class='price'>${el.price}$</p>
        <div class='btnContainer'>
          <button class='addToCard' data-id="${el.id}">Add to cart</button>
        </div>
      </div>`);
  }
}

$('.wrap').on('click', '.addToCard', function () {
  let id = $(this).data('id');
  axios.get(`https://fakestoreapi.com/products/${id}`).then(res => {
    const product = res.data;
    let found = card.find(p => p.id === product.id);
    if (found) found.quantity++;
    else {
      product.quantity = 1;
      card.push(product);
    }
    saveCart();
    $('.popupMessage').fadeIn(300).delay(1000).fadeOut(300);
  });
});

$('.card').click(() => {
  $('.cardPopup').css('transform', 'translateX(0)');
  renderCart();
});

$(document).on('click', '.closePopup', () => {
  $('.cardPopup').css('transform', 'translateX(100%)');
});

function renderCart() {
  $('.cardMain').empty();
  let total = 0;
  for (let el of card) {
    total += el.price * el.quantity;
    $('.cardMain').append(`
      <div class="cardItem" data-id="${el.id}">
        <p>${el.title}</p>
        <div class="controls">
          <button class="minus">-</button>
          <span>${el.quantity}</span>
          <button class="plus">+</button>
        </div>
        <button class="removeBtn">Видалити</button>
      </div>`);
  }
  $('#total').text(total.toFixed(2));
  $('.totalAmount, .confirmOrderBtn').show();
}

$('.cardMain')
  .on('click', '.removeBtn', function () {
    const id = $(this).closest('.cardItem').data('id');
    card = card.filter(item => item.id !== id);
    saveCart();
    renderCart();
  })
  .on('click', '.plus', function () {
    const id = $(this).closest('.cardItem').data('id');
    card.find(p => p.id === id).quantity++;
    saveCart();
    renderCart();
  })
  .on('click', '.minus', function () {
    const id = $(this).closest('.cardItem').data('id');
    let item = card.find(p => p.id === id);
    item.quantity--;
    if (item.quantity <= 0) card = card.filter(p => p.id !== id);
    saveCart();
    renderCart();
  });

$('.confirmOrderBtn').click(() => {
  if (card.length === 0) return alert("Корзина пуста.");
  let total = card.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2);
  alert(`Дякуємо за замовлення!\nТоварів: ${card.length}\nСума: $${total}`);
  card = [];
  saveCart();
  $('.cardMain').empty();
  $('.cardPopup').css('transform', 'translateX(100%)');
  $('.totalAmount, .confirmOrderBtn').hide();
});

function loadCategories() {
  axios.get('https://fakestoreapi.com/products/categories').then(res => {
    for (let cat of res.data) {
      $('#category').append(`<option value="${cat}">${cat}</option>`);
    }
  });
}

function filterCategory() {
  const category = $('#category').val();
  if (category === 'all') return loadProducts();
  axios.get(`https://fakestoreapi.com/products/category/${category}`).then(res => {
    displayProducts(res.data);
  });
}

$('#category').change(() => {
  $('.close').show();
  filterCategory();
});

$('.close').click(() => {
  $('#category').val('all');
  $('.close').hide();
  loadProducts();
});

$('#sort').change(() => {
  const category = $('#category').val();
  if (category === 'all') loadProducts();
  else filterCategory();
});

$('.chatButton').click(()=>{
  $('.chatWindows').fadeToggle(500);
});

$('chatWindows button').click(()=>{
  const msg = $('.chatWidnows input').val();
  if(!msg) return;
  alert("Повідомлення надіслано в техпідтримку");
  $('.chatWindows input').val('');
});

loadProducts();
loadCategories();