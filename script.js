const input=document.getElementById('task-input');
const dateinput=document.getElementById('date-input');
const btnadd=document.getElementById('btn-add');
const list=document.getElementById('task-list');
const counter=document.getElementById('counter');
const filterbtns=document.querySelectorAll('.filter-btn');
const selectoption=document.getElementById('select-option');
const clearbtn=document.getElementById('clear-complete');

let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let filter = 'all';
let select = 'created';

document.getElementById('today').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', day: 'numeric' , month: 'short' 
});

function save() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function formatdate(iso){
    const d= new Date (iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
        day:'numeric', month:'short'
    });
}

function isoverdate(iso, done){
    if(!iso || done)
        return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date (iso + 'T00:00:00') < today;
}

function getvisibletasks(){
    let visible = tasks.filter(t => {
        if(filter==='active') 
            return !t.done;
        if(filter==='finish')
            return t.done;
        return true;
    });

    if(select === 'due'){
        visible =[...visible].sort((a, b)=> {
            if (!a.date && !b.date) 
                return 0;
            if (!a.date) 
                return 1;
            if (!b.date)
                return -1;
            return a.date.localeCompare(b.date);
        });
    }   else {
        visible = [...visible].sort((a, b) => b.id - a.id);
    }
    return visible;
}

function startedit(text, task) {
    text.contentEditable ='true';
    text.focus();
    document.execCommand('selectAll', false, null);
}
function call(){
    list.innerHTML = '';
    const visible = getvisibletasks();

    if (visible.length === 0){
        const empty=document.createElement('li');
        empty.className = 'empty-state';
        empty.textContent = tasks.length === 0 ?
        'There is no task yet. Please add one' : 'There is no task in this category';
        list.appendChild(empty);
        }

        visible.forEach(task => {
            const li = document.createElement('li');
            li.className ='task' + (task.done ? ' completed' : ''
            );

            const check = document.createElement('button');
            check.className = 'task-check' + (task.done ? ' checked' : '');
            check.setAttribute('aria-label', task.done ? 'Mark it as unfinished' : 'Mark it as finished');
            check.addEventListener('click', () => {
                task.done = !task.done;
                if (task.done){
                     confetti({
                    particleCount:200,
                    spread:120,
                    origin:{
                        y:0.6
                    }
                });
                }
                save();
                call();
            });

            const main= document.createElement('div');
            main.className = 'task-main';

            const text = document.createElement('div');
            text.className = 'task-text';
            text.textContent = task.text;
            text.addEventListener ('blur', () => {
                text.contentEditable ='false';
                const newval = text.textContent.trim();
                if (newval){
                    task.text = newval;
                } else {
                    text.textContent = task.text;
                }
                save();
            });
            text.addEventListener('keydown', e => {
                if(e.key === 'Enter'){
                    e.preventDefault();
                    text.blur();
                }
            });

            main.appendChild(text);

            if(task.date){
                const meta = document.createElement('div');
                meta.className ='task-meta';
                const dtag = document.createElement('span');
                const overdate = isoverdate (task.date, task.done);
                dtag.className = 'tag due' + (overdate? ' overdate' : '');
                dtag.textContent = (overdate ? 'Pass • ' : '') + formatdate(task.date);
                meta.appendChild(dtag);
                main.appendChild(meta);
            }

            const actions = document.createElement('div');
            actions.className = 'task-actions';

            const edit = document.createElement('button');
            edit.className ='icon-btn';
            edit.textContent = '✎';
            edit.setAttribute ('aria-label', 'Edit task');
            edit.addEventListener('click', () => startedit(text, task));

            const del = document.createElement('button');
            del.className = 'icon-btn delete';
            del.textContent ='✕';
            del.setAttribute ('aria-label', 'Delete task');
            del.addEventListener('click', () => {
                tasks = tasks.filter (t => t.id !== task.id);
                save();
                call();
            });

            actions.appendChild(edit);
            actions.appendChild(del);

            li.appendChild(check);
            li.appendChild(main);
            li.appendChild(actions);
            list.appendChild(li);
        }); 

        const remain = tasks.filter (t => !t.done).length;
        counter.textContent = `${remain} Remaining tasks`;
    }

        function addtask(){
            const value = input.value.trim();
            if (!value)
                return;
            tasks.push({
                id: Date.now(),
                text: value,
                done: false,
                date: dateinput.value || null
            });
            input.value = '';
            dateinput.value = '';
            save();
            call();
            input.focus();
        }

        btnadd.addEventListener('click', addtask);
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter')
                addtask();
        });

        filterbtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterbtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filter = btn.dataset.filter;
                call();
           
            });
        });

        selectoption.addEventListener('change', () => {
            select = selectoption.value;
            call();
        });

        clearbtn.addEventListener('click', () => {
            tasks = tasks.filter (t => !t.done);
            save();
            call();
        });

        call();


