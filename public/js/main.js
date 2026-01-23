let page = 1;

async function loadMore() {
  page++;

  const res = await fetch(`/sarees?page=${page}`, {
    headers: { "X-Requested-With": "XMLHttpRequest" }
  });

  const sarees = await res.json();
  const container = document.getElementById("saree-container");

  sarees.forEach(saree => {
    const div = document.createElement("div");
    div.className = "col-md-4 mb-4";
    div.innerHTML = `
      <div class="card h-100 fade-in">
        <img src="${saree.image.url}" class="card-img-top">
        <div class="card-body">
          <h5>${saree.name}</h5>
          <p>₹ ${saree.price}</p>
          <a href="/cart/add/${saree._id}" class="btn btn-outline-dark">
            Add to Cart
          </a>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}
