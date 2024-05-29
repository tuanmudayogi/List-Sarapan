document.addEventListener('DOMContentLoaded', () => {
    const breakfastForm = document.getElementById('breakfastForm');
    const groupedBreakfastList = document.getElementById('groupedBreakfastList');
    const menuDropdown = document.getElementById('menu');
    const dateDisplay = document.createElement('div');
    dateDisplay.id = 'dateDisplay';
    document.body.insertBefore(dateDisplay, groupedBreakfastList);

    const menuByDay = {
        'Monday': ['Nasi Uduk', 'Nasi Kuning'],
        'Tuesday': ['Sate', 'Soto'],
        'Wednesday': ['Bubur', 'Lontong Sayur'],
        'Thursday': ['Lontong Kari', 'Sate'],
        'Friday': ['Nasi Goreng', 'Nasi Kuning']
    };

    const additionalItems = ['Semangka', 'Melon', 'Jambu Air', 'Pepaya', 'Nanas'];

    function loadBreakfastList() {
        const storedList = localStorage.getItem('breakfastList');
        return storedList ? JSON.parse(storedList) : [];
    }

    function saveBreakfastList(list) {
        localStorage.setItem('breakfastList', JSON.stringify(list));
    }

    function renderList(list) {
        groupedBreakfastList.innerHTML = '';

        const grouped = groupByMenu(list);

        for (const menu in grouped) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'group';

            const groupTitle = document.createElement('h2');
            groupTitle.textContent = menu;
            groupDiv.appendChild(groupTitle);

            const ul = document.createElement('ul');

            grouped[menu].forEach(item => {
                const li = document.createElement('li');

                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = item.done || false;
                checkbox.addEventListener('change', () => {
                    updateItemStatus(menu, item.name, checkbox.checked);
                });
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(`${item.name} - ${item.quantity}`));
                if (item.notes) {
                    label.appendChild(document.createTextNode(` (${item.notes})`)); // Tambahkan catatan jika ada
                }

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Hapus';
                deleteButton.addEventListener('click', () => {
                    removeItem(menu, item.name);
                });

                li.appendChild(label);
                li.appendChild(deleteButton);
                ul.appendChild(li);
            });

            groupDiv.appendChild(ul);
            groupedBreakfastList.appendChild(groupDiv);
        }
    }

    function addItem(name, menu, quantity, notes) {
        const list = loadBreakfastList();
        list.push({ name, menu, quantity, notes });
        saveBreakfastList(list);
        renderList(list);
    }

    function removeItem(menu, name) {
        const list = loadBreakfastList();
        const index = list.findIndex(item => item.menu === menu && item.name === name);
        if (index !== -1) {
            list.splice(index, 1);
            saveBreakfastList(list);
            renderList(list);
        }
    }

    function groupByMenu(list) {
        return list.reduce((groups, item) => {
            const { menu } = item;
            if (!groups[menu]) {
                groups[menu] = [];
            }
            groups[menu].push(item);
            return groups;
        }, {});
    }

    function updateItemStatus(menu, name, done) {
        const list = loadBreakfastList();
        const index = list.findIndex(item => item.menu === menu && item.name === name);
        if (index !== -1) {
            list[index].done = done;
            saveBreakfastList(list);
            renderList(list);
        }
    }

    function displayCurrentDate() {
        const currentDate = new Date();
        const currentDay = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

        // Cek waktu berlaku menu
        const currentHour = currentDate.getHours();
        const validFromHour = 17; // Jam 17.00
        const validToHour = 16; // Jam 10.00 (keesokan harinya)

        // Atur menu berdasarkan waktu berlaku
        let menuForToday = [];
        if (currentHour >= validFromHour || currentHour < validToHour) {
            // Jika masih dalam rentang waktu berlaku
            menuForToday = menuByDay[currentDay] || [];
        }

        const combinedMenu = [...menuForToday, ...additionalItems];

        menuDropdown.innerHTML = '';
        combinedMenu.forEach(menuItem => {
            const option = document.createElement('option');
            option.value = menuItem;
            option.textContent = menuItem;
            menuDropdown.appendChild(option);
        });

        // Tampilkan tanggal saat ini
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-US', options);
        dateDisplay.textContent = `Tanggal: ${formattedDate}`;
    }

    // Validasi input kuantitas
    const quantityInput = document.getElementById('quantity');
    quantityInput.addEventListener('input', () => {
        const value = quantityInput.value;
        if (!/^\d*\.?\d*$|^\d*\/\d+$/.test(value))
            {
                quantityInput.setCustomValidity('Masukkan angka, desimal, atau pecahan yang valid.');
            } else {
                quantityInput.setCustomValidity('');
            }
        });
    
        breakfastForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const menu = menuDropdown.value;
            const quantity = document.getElementById('quantity').value;
            const notes = document.getElementById('notes').value;
            addItem(name, menu, quantity, notes);
            breakfastForm.reset();
        });
    
        // Initial display of menu based on current date
        displayCurrentDate();
    
        // Update menu based on current date every minute
        setInterval(displayCurrentDate, 60000);
    });
    
