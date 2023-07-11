
let addToCartById = document.getElementsByClassName("cartInfo")[0];
const API_URL = "http://localhost:8080/api";

function putIntoCart(_id) {
  const cartIdValue = addToCartById?.getAttribute("id");
  if (cartIdValue === undefined) {
    window.location.href = "/auth/profile";
  }
  const url = API_URL + "/carts/" + cartIdValue + "/product/" + _id;
  const data = {};
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  fetch(url, options)
    .then((response) => response.json())
    .then((res) => {
      alert("Product add to cart");
    })
    .catch((error) => {
      console.error("Error:", error);
      alert(JSON.stringify(error));
    });    
}

function removeProductFromCart(_id) {
  addToCartById = localStorage.getItem("carrito-id");
  const url = API_URL + "/carts/" + addToCartById + "/products/" + _id;

  const options = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  };

  fetch(url, options)
    .then((response) => response.json())
    .then((res) => {
      alert("Product removed from cart");
    })
    .catch((error) => {
      console.error("Error:", error);
      alert(JSON.stringify(error));
    });
}

//FUNCION PARA VACIAR CARRITO
function clearCart() {
  addToCartById = localStorage.getItem("carrito-id");
  const url = API_URL + "/carts/" + addToCartById;

  const options = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  };

  window.location.reload();

  fetch(url, options)
    .then((response) => response.json())
    .then((res) => {
      alert("Cart cleared successfully");
    })
    .catch((error) => {
      console.error("Error:", error);
      alert(JSON.stringify(error));
    });
}


