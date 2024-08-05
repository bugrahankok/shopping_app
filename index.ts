import { v4 as uuidV4 } from 'uuid';

type NewProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  completed: boolean;
  createdAt: Date;
};

type CartItem = {
  product: NewProduct;
  quantity: number;
};

const list = document.querySelector<HTMLUListElement>("#list");
const form = document.querySelector<HTMLFormElement>("#product-form");
const nameInput = document.querySelector<HTMLInputElement>("#product-name");
const categoryInput = document.querySelector<HTMLInputElement>("#product-category");
const priceInput = document.querySelector<HTMLInputElement>("#product-price");
const cartList = document.querySelector<HTMLUListElement>("#cart");
const checkoutButton = document.querySelector<HTMLButtonElement>("#checkout-button");
const clearCartButton = document.querySelector<HTMLButtonElement>("#clear-cart-button");
const totalPriceElement = document.querySelector<HTMLSpanElement>("#total-price");
const products: NewProduct[] = loadProducts() || [];
const cart: CartItem[] = loadCart() || [];

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("JWT_TOKEN");
  console.log("Token:", token); 
  const authContainer = document.querySelector<HTMLDivElement>(".auth-container");
  const productContainer = document.querySelector<HTMLDivElement>(".product-container");

  if (token) {
    console.log("Kullanıcı giriş yapmış.");
    if (authContainer) {
      authContainer.style.display = "none";
    }
    if (productContainer) {
      productContainer.style.display = "block";
    }

    try {
      const dbProducts = await fetchProductsFromDatabase();
      console.log("Ürünler:", dbProducts);
      if (Array.isArray(dbProducts)) {
        products.length = 0; 
        dbProducts.forEach(product => {
          products.push(product);
          addListItem(product);
        });
        renderCart();
        updateTotalPrice();
      } else {
        console.error("Ürün verisi bir dizi değil:", dbProducts);
      }
    } catch (error) {
      console.error("Veritabanından ürünleri almakta hata:", error);
    }
  } else {
    console.log("Kullanıcı giriş yapmamış.");
    if (authContainer) {
      authContainer.style.display = "block";
    }
    if (productContainer) {
      productContainer.style.display = "none";
    }
  }
});

async function registerUser(email: string, username: string, password: string) {
    try {
        const response = await fetch("http://localhost:8080/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },aa
            body: JSON.stringify({ email, username, password }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Kayıt başarısız");
        }
        alert("Kayıt başarılı!");
        window.location.reload(); 
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Kayıt hatası:", error.message);
            alert(error.message);
        } else {
            console.error("Kayıt hatası:", error);
            alert("Kayıt hatası");
        }
    }
}

async function loginUser(username: string, password: string) {
    try {
        const response = await fetch("http://localhost:8080/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Giriş başarısız: ${errorText}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const { token } = await response.json();
            localStorage.setItem("JWT_TOKEN", token);
            alert("Giriş başarılı!");
            window.location.reload(); 
        } else {
            const errorText = await response.text();
            throw new Error(`Giriş başarısız: ${errorText}`);
        }
    } catch (error) {
        if (error instanceof Error) {
            console.error("Giriş hatası:", error.message);
            alert(error.message);
        } else {
            console.error("Giriş hatası:", error);
            alert("Giriş hatası");
        }
    }
}

function logoutUser() {
    localStorage.removeItem("JWT_TOKEN");
    alert("Çıkış yapıldı!");
    window.location.reload();
}

const registrationForm = document.querySelector<HTMLFormElement>("#registration-form");
const loginForm = document.querySelector<HTMLFormElement>("#login-form");
const logoutButton = document.querySelector<HTMLButtonElement>("#logout-button");

registrationForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = (document.querySelector<HTMLInputElement>("#register-username")?.value || "").trim();
    const email = (document.querySelector<HTMLInputElement>("#register-email")?.value || "").trim();
    const password = (document.querySelector<HTMLInputElement>("#register-password")?.value || "").trim();
    if (username && email && password) {
        await registerUser(username, email, password);
    }
});

loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = (document.querySelector<HTMLInputElement>("#login-username")?.value || "").trim();
    const password = (document.querySelector<HTMLInputElement>("#login-password")?.value || "").trim();
    if (username && password) {
        await loginUser(username, password);
    }
});

logoutButton?.addEventListener("click", logoutUser);

form?.addEventListener("submit", async e => {
    e.preventDefault();

    if (!nameInput?.value || !categoryInput?.value || !priceInput?.value) return;

    const newProduct: NewProduct = {
        id: uuidV4(),
        name: nameInput.value,
        category: categoryInput.value,
        price: parseFloat(priceInput.value),
        completed: false,
        createdAt: new Date(),
    };

    try {
        await saveProductToDatabase(newProduct);
        products.push(newProduct);
        addListItem(newProduct);
        nameInput.value = "";
        categoryInput.value = "";
        priceInput.value = "";
    } catch (error) {
        console.error("Ürünü veritabanına kaydetme hatası:", error);
    }
});

checkoutButton?.addEventListener("click", checkoutCart);
clearCartButton?.addEventListener("click", clearCart);

function addListItem(newProduct: NewProduct) {
    if (!list) return;
    const item = document.createElement("li");
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    const addToCartButton = document.createElement("button");
    
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", () => {
        newProduct.completed = checkbox.checked;
        if (checkbox.checked) {
            nameInput!.value = newProduct.name;
            categoryInput!.value = newProduct.category;
            priceInput!.value = newProduct.price.toString();
        } else {
            nameInput!.value = "";
            categoryInput!.value = "";
            priceInput!.value = "";
        }
    });
    checkbox.checked = newProduct.completed;
    
    addToCartButton.textContent = "Ekle";
    addToCartButton.addEventListener("click", () => addToCart(newProduct));

    label.append(checkbox, `${newProduct.name} - ${newProduct.category} - ${newProduct.price} TL`);
    item.append(label, addToCartButton);
    list.append(item);
}

function addToCart(product: NewProduct) {
    const existingCartItem = cart.find(item => item.product.id === product.id);
    if (existingCartItem) {
        existingCartItem.quantity++;
    } else {
        cart.push({ product, quantity: 1 });
    }
    saveCart();
    renderCart();
    displayButton();
    updateTotalPrice();
}

function renderCart() {
    if (!cartList) return;
    cartList.innerHTML = "";
    cart.forEach(cartItem => {
        const item = document.createElement("li");
        item.textContent = `${cartItem.product.name} - ${cartItem.quantity} x - ${cartItem.product.price * cartItem.quantity} TL`;
        cartList.append(item);
    });
    displayButton();
    updateTotalPrice();
}

function checkoutCart() {
    alert("Satın alma işleminiz başarılı!");
    cart.length = 0;
    saveCart();
    renderCart();
    displayButton();
    updateTotalPrice();
}

function clearCart() {
    alert("Sepetiniz temizlendi.");
    cart.length = 0;
    updateTotalPrice();
    saveCart();
    renderCart();
    displayButton();
}

function updateTotalPrice() {
    const totalPrice = cart.reduce((total, cartItem) => total + cartItem.product.price * cartItem.quantity, 0);
    if (totalPriceElement) {
        totalPriceElement.textContent = `${totalPrice} TL`;
    }
}

function displayButton() {
    const button = document.querySelector<HTMLButtonElement>("#checkout-button");
    if (cart.length > 0) {
        button!.style.display = "block";
    } else {
        button!.style.display = "none";
    }
}

async function fetchProductsFromDatabase(): Promise<NewProduct[]> {
    const token = localStorage.getItem("JWT_TOKEN"); 
    console.log("Fetch için Token:", token);
    const response = await fetch("http://localhost:8080/product/getAll", {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        const message = `An error has occurred: ${response.status}`;
        throw new Error(message);
    }
    return await response.json();
}

function saveProducts() {
    localStorage.setItem("products", JSON.stringify(products));
}

function loadProducts(): NewProduct[] {
    const productsJSON = localStorage.getItem("products");
    return productsJSON ? JSON.parse(productsJSON) : [];
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  
  function loadCart(): CartItem[] {
    const cartJSON = localStorage.getItem("cart");
    return cartJSON ? JSON.parse(cartJSON) : [];
  }

async function saveProductToDatabase(product: NewProduct) {
    const token = localStorage.getItem("JWT_TOKEN");
    const response = await fetch("http://localhost:8080/product/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(product),
    });
    if (!response.ok) {
        const message = `An error has occurred: ${response.status}`;
        throw new Error(message);
    }
}

function renderProductList(products: NewProduct[]) {
    list!.innerHTML = ""; 
    products.forEach(product => {
        addListItem(product);
    });
}
