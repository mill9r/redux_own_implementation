function createStore(reducer) {
    let state = reducer(undefined, {type: 'INIT'});
    let subscribers = [];

    return {
        getState() {
            return state;
        },
        subscribe(subscriber) {
            subscribers = subscribers.concat(subscriber);

            return () => {
                subscribers = subscribers.filter(sbscrb => subscriber !== sbscrb);
            }
        },
        dispatch(action) {
            state = reducer(state, action);
            subscribers.forEach(subscriber => subscriber());
        },
    }

}


const reducer = (state = 0, action) => {
    if (action.type === 'INCREMENT') {
        return state + 1;
    } else if (action.type === 'DECREMENT') {
        return state - 1;
    }
};
// убираем промоис и делаем через так называемый func -> вернем функцию, которая внутри себя принимает dispatch
// будет аналогичное поведение Promise -> если надо использовать async используют Thunk
function incrementAsync() {
    return (dispatch)=>{
        setTimeout(()=>{
            dispatch({type:'INCREMENT'})
        },1000)
    }
}

//если action принимает промис, то не даем вернуть значение и вернем только когда промис зарезолвится
function addPromiseSupport(store, dispatch) {
    return (action) => {
        if ('then' in action) {
            // не даем action попасть в reducer, пока не зарезолвится
            return action.then(asyncSection => dispatch(asyncSection))
        }

        return dispatch(action);
    }
}


function addLoger(store, dispatch) {
    return (action) => {
        console.log('PREVIOUS STATE', store.getState());
        console.log('ACTION', action);
        dispatch(action);
        console.log('CURRENT STATE', store.getState());

    }
}

//добавляем функциональным подход
// thunk используется вместо асинхронности
function addThunkSupport(store, dispatch) {
    return(action)=>{
        if (typeof action ==='function'){
            return action(dispatch);
        }
        return dispatch(action);
    }
}


const store = createStore(reducer);
p = console.log;


//прокачиваем dispatch
store.dispatch = addLoger(store, store.dispatch);
store.dispatch = addPromiseSupport(store, store.dispatch);
store.dispatch = addThunkSupport(store, store.dispatch);

store.dispatch(incrementAsync());

