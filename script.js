document.addEventListener("DOMContentLoaded", function () {
    const balanceEl = document.getElementById("balance");
    const incomeEl = document.getElementById("inc-amt");
    const expenseEl = document.getElementById("exp-amt");
    const form = document.getElementById("form");
    const descInput = document.getElementById("desc");
    const amountInput = document.getElementById("amount");
    const transactionsEl = document.getElementById("trans");

    // Retrieve transactions from Local Storage or initialize an empty array
    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

    // Function to update the UI
    function updateDOM() {
        transactionsEl.innerHTML = "";
        let totalIncome = 0, totalExpense = 0;

        transactions.forEach((trans, index) => {
            const sign = trans.amount < 0 ? "-" : "+";
            const item = document.createElement("li");
            item.classList.add(trans.amount < 0 ? "exp" : "inc");
            item.innerHTML = `
                ${trans.desc} <span>${sign} ₹${Math.abs(trans.amount).toFixed(2)}</span>
                <button class="btn-del" onclick="deleteTransaction(${index})">x</button>
            `;

            transactionsEl.appendChild(item);
            if (trans.amount < 0) totalExpense += Math.abs(trans.amount);
            else totalIncome += trans.amount;
        });

        balanceEl.textContent = `₹ ${(totalIncome - totalExpense).toFixed(2)}`;
        incomeEl.textContent = `₹ ${totalIncome.toFixed(2)}`;
        expenseEl.textContent = `₹ ${totalExpense.toFixed(2)}`;

        localStorage.setItem("transactions", JSON.stringify(transactions));
    }

    // Function to handle adding a transaction
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const desc = descInput.value.trim();
        const amount = parseFloat(amountInput.value.trim());

        if (desc === "" || isNaN(amount)) {
            alert("Please enter a valid description and amount.");
            return;
        }

        transactions.push({ desc, amount });
        descInput.value = "";
        amountInput.value = "";
        updateDOM();
    });

    // Function to delete a transaction
    window.deleteTransaction = (index) => {
        transactions.splice(index, 1);
        updateDOM();
    };

    // Initialize the tracker with existing transactions
    updateDOM();
});
