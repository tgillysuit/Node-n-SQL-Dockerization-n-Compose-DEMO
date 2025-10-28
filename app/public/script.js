document.addEventListener('DOMContentLoaded', function() {
    const itemForm = document.getElementById('grocery-item-form');
    const messageDiv = document.getElementById('message');
    const usersContainer = document.getElementById('users-container');
    const pendingItemsSection = document.getElementById('pending-items-section');
    const pendingItemsContainer = document.getElementById('pending-items-container');
    const pendingCount = document.getElementById('pending-count');
    const submitAllBtn = document.getElementById('submit-all-btn');
    
    // Modal elements
    const modal = document.getElementById('add-item-modal');
    const modalListTitle = document.getElementById('modal-list-title');
    const modalItemForm = document.getElementById('modal-item-form');
    const modalItemName = document.getElementById('modal-item-name');
    const modalItemQuantity = document.getElementById('modal-item-quantity');
    const closeModal = document.querySelector('.close');
    const cancelBtn = document.querySelector('.btn-cancel');

    // Store pending items before submission
    let pendingItems = [];
    let currentUserName = '';
    let currentModalListId = null;

    // Load users on page load
    loadAllUsers();

    // Modal controls
    closeModal.onclick = () => modal.style.display = 'none';
    cancelBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Handle modal form submission
    modalItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const itemName = modalItemName.value.trim();
        const quantity = parseInt(modalItemQuantity.value);

        if (!currentModalListId) {
            showMessage('Error: No list selected', 'error');
            return;
        }

        try {
            const response = await fetch(`/lists/${currentModalListId}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: itemName, quantity: quantity })
            });

            if (!response.ok) {
                throw new Error('Failed to add item');
            }

            showMessage(`Added "${itemName}" successfully!`, 'success');
            modal.style.display = 'none';
            modalItemName.value = '';
            modalItemQuantity.value = '1';
            
            // Reload users display
            await loadAllUsers();
        } catch (error) {
            console.error('Error adding item:', error);
            showMessage(`Error: ${error.message}`, 'error');
        }
    });

    // Global function to open modal for adding item to existing list
    window.openAddItemModal = function(listId, listTitle) {
        currentModalListId = listId;
        modalListTitle.textContent = listTitle;
        modal.style.display = 'block';
        modalItemName.focus();
    };

    // Handle adding item to pending list
    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const item = document.getElementById('item').value.trim();
        const quantity = parseInt(document.getElementById('quantity').value);

        // Check if user changed their name
        if (currentUserName && currentUserName !== name) {
            if (!confirm(`You were adding items for "${currentUserName}". Do you want to switch to "${name}"? Your pending items will be cleared.`)) {
                return;
            }
            pendingItems = [];
        }

        currentUserName = name;

        // Add item to pending list
        pendingItems.push({
            id: Date.now(),
            name: item,
            quantity: quantity
        });

        // Clear item fields but keep the name
        document.getElementById('item').value = '';
        document.getElementById('quantity').value = '1';
        document.getElementById('item').focus();

        // Update display
        displayPendingItems();
        showMessage(`Added "${item}" to pending list. Add more items or submit all.`, 'success');
    });

    // Handle submitting all pending items
    submitAllBtn.addEventListener('click', async () => {
        if (pendingItems.length === 0) {
            showMessage('No items to submit!', 'error');
            return;
        }

        submitAllBtn.disabled = true;
        submitAllBtn.textContent = 'Submitting...';

        try {
            await submitAllItems();
            
            // Clear pending items
            pendingItems = [];
            currentUserName = '';
            document.getElementById('name').value = '';
            
            displayPendingItems();
            showMessage('All items submitted successfully!', 'success');
            
            // Reload users display
            await loadAllUsers();
        } catch (error) {
            console.error('Error submitting items:', error);
            showMessage(`Error: ${error.message}`, 'error');
        } finally {
            submitAllBtn.disabled = false;
            submitAllBtn.textContent = 'Submit All Items';
        }
    });

    // Display pending items
    function displayPendingItems() {
        if (pendingItems.length === 0) {
            pendingItemsSection.style.display = 'none';
            return;
        }

        pendingItemsSection.style.display = 'block';
        pendingCount.textContent = pendingItems.length;

        pendingItemsContainer.innerHTML = '';

        pendingItems.forEach((item) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'pending-item';
            itemDiv.innerHTML = `
                <div class="pending-item-info">
                    <div class="pending-item-name">${item.name}</div>
                    <div class="pending-item-quantity">Quantity: ${item.quantity}</div>
                </div>
                <div class="pending-item-actions">
                    <button class="btn-edit" onclick="editPendingItem(${item.id})">Edit</button>
                    <button class="btn-remove" onclick="removePendingItem(${item.id})">Remove</button>
                </div>
            `;
            pendingItemsContainer.appendChild(itemDiv);
        });
    }

    // Make functions globally accessible
    window.editPendingItem = function(itemId) {
        const item = pendingItems.find(i => i.id === itemId);
        if (!item) return;

        const newName = prompt('Edit item name:', item.name);
        if (newName && newName.trim()) {
            item.name = newName.trim();
        }

        const newQuantity = prompt('Edit quantity:', item.quantity);
        if (newQuantity && !isNaN(newQuantity) && parseInt(newQuantity) > 0) {
            item.quantity = parseInt(newQuantity);
        }

        displayPendingItems();
        showMessage('Item updated!', 'success');
    };

    window.removePendingItem = function(itemId) {
        pendingItems = pendingItems.filter(i => i.id !== itemId);
        displayPendingItems();
        showMessage('Item removed from list.', 'success');
    };

    // Submit all items to the server
    async function submitAllItems() {
        // Step 1: Create or get user
        const userResponse = await fetch('/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: currentUserName })
        });

        let user;
        if (!userResponse.ok) {
            const usersResponse = await fetch('/users');
            const users = await usersResponse.json();
            user = users.find(u => u.name === currentUserName);
            
            if (!user) {
                throw new Error('Failed to create or find user');
            }
        } else {
            user = await userResponse.json();
        }

        // Step 2: Create or get list for user
        const listResponse = await fetch(`/users/${user.id}/lists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: `${currentUserName}'s Grocery List` })
        });

        let list;
        if (!listResponse.ok) {
            const listsResponse = await fetch(`/users/${user.id}/lists`);
            const lists = await listsResponse.json();
            list = lists[0];
            
            if (!list) {
                throw new Error('Failed to create or find list');
            }
        } else {
            list = await listResponse.json();
        }

        // Step 3: Add all pending items to the list
        for (const item of pendingItems) {
            const itemResponse = await fetch(`/lists/${list.id}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: item.name,
                    quantity: item.quantity
                })
            });

            if (!itemResponse.ok) {
                throw new Error(`Failed to add item: ${item.name}`);
            }
        }
    }

    // Load and display all users with their lists
    async function loadAllUsers() {
        try {
            const usersResponse = await fetch('/users');
            const users = await usersResponse.json();

            if (users.length === 0) {
                usersContainer.innerHTML = '<p class="no-data">No users yet. Add items to get started!</p>';
                return;
            }

            const usersWithLists = await Promise.all(
                users.map(async (user) => {
                    const listsResponse = await fetch(`/users/${user.id}/lists?includeItems=1`);
                    const lists = await listsResponse.json();
                    return { ...user, lists };
                })
            );

            displayUsers(usersWithLists);
        } catch (error) {
            console.error('Error loading users:', error);
            usersContainer.innerHTML = '<p class="no-data error">Failed to load users.</p>';
        }
    }

    // Display users and their lists
    function displayUsers(users) {
        usersContainer.innerHTML = '';

        users.forEach(user => {
            const userCard = document.createElement('div');
            userCard.className = 'user-card';

            let userHTML = `<h3>${user.name}</h3>`;

            if (user.lists && user.lists.length > 0) {
                user.lists.forEach(list => {
                    userHTML += `
                        <div class="grocery-list">
                            <h4>${list.title}</h4>
                    `;

                    if (list.items && list.items.length > 0) {
                        userHTML += '<ul class="grocery-items">';
                        list.items.forEach(item => {
                            const checkedClass = item.checked ? 'item-checked' : '';
                            userHTML += `
                                <li class="${checkedClass}">
                                    <span class="item-name">${item.name}</span>
                                    <span class="item-quantity">Qty: ${item.quantity}</span>
                                </li>
                            `;
                        });
                        userHTML += '</ul>';
                    } else {
                        userHTML += '<p class="no-data">No items in this list yet.</p>';
                    }

                    // Add "Add More Items" button
                    userHTML += `
                        <button class="btn-add-more" onclick="openAddItemModal(${list.id}, '${list.title}')">
                            + Add More Items
                        </button>
                    `;

                    userHTML += '</div>';
                });
            } else {
                userHTML += '<p class="no-data">No grocery lists yet.</p>';
            }

            userCard.innerHTML = userHTML;
            usersContainer.appendChild(userCard);
        });
    }

    function showMessage(text, type) {
        if (!messageDiv) {
            console.error('Message div not found!');
            alert(text);
            return;
        }
        
        messageDiv.textContent = text;
        messageDiv.className = type;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
});