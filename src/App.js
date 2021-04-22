import React from "react";
import data from "./data.json";
import Products from "./components/Products";
import Filter from "./components/Filter";
import Cart from "./components/Cart";

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      products: data.products,
      cartItems: localStorage.getItem("cartItems")
        ? JSON.parse(localStorage.getItem("cartItems"))
        : [],
      size: "",
      sort: "",
      visible: true,
    };
    this.myRef = React.createRef();
  }
  componentDidMount() {
    if (
      this.props.match.params.recharge &&
      this.props.match.params.user &&
      this.props.match.params.email &&
      this.props.match.params.money &&
      this.props.match.params.from &&
      this.props.match.params.whereTo
    ) {
      this.setState({ visible: false });
      (async () => {
        const order = {};
        order.money = this.props.match.params.money;
        order.name = this.props.match.params.user;
        order.email = this.props.match.params.email;
        order.address = this.props.match.params.recharge;
        order.from = this.props.match.params.from;
        order.whereTo = this.props.match.params.whereTo;
        order.status = 1;
        const response = await fetch("/recharge", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(order),
        });
        const data = await response.json();
        if (response.status == 200) {
          var f = document.createElement("form");
          f.setAttribute("method", "post");
          f.setAttribute("action", data.url + "/" + order.from);

          var i = document.createElement("script"); //input element, text
          i.setAttribute("src", "https://checkout.razorpay.com/v1/checkout.js");
          i.setAttribute("data-key", data.key);
          i.setAttribute("data-amount", data.order.amount);
          i.setAttribute("data-currency", data.order.currency);
          i.setAttribute("data-order_id", data.order.id);
          i.setAttribute("data-name", "Elison Shop");
          i.setAttribute("data-description", "Transaction");
          i.setAttribute("data-image", "");
          i.setAttribute(
            "data-prefill.name",
            data.email.substr(0, data.email.indexOf("@") - 1)
          );
          i.setAttribute("data-prefill.email", data.email);
          i.setAttribute("data-theme.color", "#F37254");
          f.appendChild(i);
          var i = document.createElement("input");
          i.setAttribute("type", "hidden");
          i.setAttribute("custom", "Hidden Element");
          i.setAttribute("name", "hidden");
          f.appendChild(i);
          // console.log(btn);
          if (this.myRef.current.hasChildNodes()) {
            this.myRef.current.removeChild(this.myRef.current.firstChild);
          }
          this.myRef.current.appendChild(f);
          setTimeout(() => {
            console.log(
              document.getElementsByClassName("razorpay-payment-button")
            );
            document
              .getElementsByClassName("razorpay-payment-button")[0]
              .click();
          }, 3000);
        }
      })();
    } else if (
      this.props.match.params.recharge &&
      this.props.match.params.recharge == "success"
    ) {
      alert("Deposit Successfully");
    } else if (
      this.props.match.params.recharge &&
      this.props.match.params.recharge == "failed"
    ) {
      alert("Deposit Failed");
    }
  }
  sortProducts = (event) => {
    const sort = event.target.value;
    this.setState({
      sort: sort,
      products: data.products
        .slice()
        .sort((a, b) =>
          sort === "lowest"
            ? a.price > b.price
              ? 1
              : -1
            : sort === "heighest"
            ? a.price < b.price
              ? 1
              : -1
            : a._id > b._id
            ? 1
            : -1
        ),
    });
  };

  filterProducts = (event) => {
    if (event.target.value !== "") {
      this.setState({
        size: event.target.value,
        products: data.products.filter(
          (product) => product.availableSizes.indexOf(event.target.value) >= 0
        ),
      });
    } else {
      this.setState({
        size: event.target.value,
        products: data.products,
      });
    }
  };

  addToCart = (product) => {
    const cartItems = this.state.cartItems.slice();
    let alreadyInCart = false;

    cartItems.forEach((item) => {
      if (item._id === product._id) {
        item.count++;
        alreadyInCart = true;
      }
    });

    if (!alreadyInCart) {
      cartItems.push({ ...product, count: 1 });
    }

    this.setState({
      cartItems,
    });

    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  };

  removeFromCart = (product) => {
    const cartItems = this.state.cartItems.slice();

    this.setState({
      cartItems: cartItems.filter((item) => item._id !== product._id),
    });

    localStorage.setItem(
      "cartItems",
      JSON.stringify(cartItems.filter((item) => item._id !== product._id))
    );
  };

  createOrder = async (order) => {
    console.log(order);
    const money = order.cartItems.reduce((a, b) => b.price * b.count + a, 0);
    if (
      money == 0 ||
      order.email == "" ||
      order.address == "" ||
      order.name == ""
    )
      return;

    const response = await fetch("/recharge", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ money, ...order, status: 0 }),
    });
    const data = await response.json();
    if (response.status == 200) {
      var f = document.createElement("form");
      f.setAttribute("method", "post");
      f.setAttribute("action", data.url);

      var i = document.createElement("script"); //input element, text
      i.setAttribute("src", "https://checkout.razorpay.com/v1/checkout.js");
      i.setAttribute("data-key", data.key);
      i.setAttribute("data-amount", data.order.amount);
      i.setAttribute("data-currency", data.order.currency);
      i.setAttribute("data-order_id", data.order.id);
      i.setAttribute("data-name", "Elison Shop");
      i.setAttribute("data-description", "Transaction");
      i.setAttribute("data-image", "");
      i.setAttribute(
        "data-prefill.name",
        data.email.substr(0, data.email.indexOf("@") - 1)
      );
      i.setAttribute("data-prefill.email", data.email);
      i.setAttribute("data-theme.color", "#F37254");
      f.appendChild(i);
      var i = document.createElement("input");
      i.setAttribute("type", "hidden");
      i.setAttribute("custom", "Hidden Element");
      i.setAttribute("name", "hidden");
      f.appendChild(i);
      // console.log(btn);
      if (this.myRef.current.hasChildNodes()) {
        this.myRef.current.removeChild(this.myRef.current.firstChild);
      }
      this.myRef.current.appendChild(f);
      setTimeout(() => {
        console.log(document.getElementsByClassName("razorpay-payment-button"));
        document.getElementsByClassName("razorpay-payment-button")[0].click();
      }, 3000);
      //
      //manual
      // alert('Send your request successfully! After checking up, money will be added to your wallet.');
    } else alert(data.error);
  };

  render() {
    const { products, size, sort, cartItems, visible } = this.state;
    const {
      sortProducts,
      filterProducts,
      addToCart,
      removeFromCart,
      createOrder,
    } = this;
    return (
      <div className="grid-container">
        <header>
          {this.props.match.params.recharge &&
          this.props.match.params.user &&
          this.props.match.params.email &&
          this.props.match.params.money &&
          this.props.match.params.from &&
          this.props.match.params.whereTo ? (
            <a href="/">
              {this.props.match.params.from === 0
                ? process.env.REACT_APP_LOTTERY_0_NAME
                : this.props.match.params.from === 1
                ? process.env.REACT_APP_LOTTERY_1_NAME
                : process.env.REACT_APP_LOTTERY_2_NAME}{" "}
              Shops
            </a>
          ) : (
            <>
              <a href="/">{this.props.match.params.from === 0
                ? process.env.REACT_APP_LOTTERY_0_NAME
                : this.props.match.params.from === 1
                ? process.env.REACT_APP_LOTTERY_1_NAME
                : process.env.REACT_APP_LOTTERY_2_NAME} Shopping Cart</a>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <a href="/login" style={{ float: "right" }}>
                login
              </a>
            </>
          )}
        </header>
        <main>
          <div className="content">
            {visible ? (
              <div className="main">
                <Filter
                  count={products.length}
                  size={size}
                  sort={sort}
                  sortProducts={sortProducts}
                  filterProducts={filterProducts}
                />
                <Products products={products} addToCart={addToCart} />
              </div>
            ) : (
              ""
            )}

            <div className="sidebar">
              {visible ? (
                <Cart
                  cartItems={cartItems}
                  removeFromCart={removeFromCart}
                  createOrder={createOrder}
                />
              ) : (
                ""
              )}
              <div ref={this.myRef} style={{ textAlign: "center" }}></div>
            </div>
          </div>
        </main>
        <footer>
          <a href="/about_us.htm" target="about">
            About US
          </a>{" "}
          &nbsp; &nbsp; &nbsp;
          <a href="/contact_us.htm" target="contact_us">
            Contact US
          </a>{" "}
          &nbsp; &nbsp; &nbsp;
          <a href="/privacy_Policy.htm" target="privacy_Policy">
            Privacy Policy
          </a>{" "}
          &nbsp; &nbsp; &nbsp;
          <a href="/Refund_Policy.htm" target="Refund_Policy">
            Refund Policy
          </a>{" "}
          &nbsp; &nbsp; &nbsp;
          <a href="/Terms_and_Conditions.htm" target="Terms_and_Conditions">
            Terms and Conditions
          </a>
        </footer>
      </div>
    );
  }
}

export default App;
