import React, { useState } from 'react';
import uuid from 'react-uuid';
import styles from './Cookbook.module.css';
import classNames from 'classnames';
import { useDrag, useDrop } from 'react-dnd';
import Ingredient from './Ingredient';
import CookingStage from './CookingStage';
import Group from './Group';
import Popup from './Popup';
import Form from './Form';


function createIngredientComponent({id, name, amount, unit}) {
    return <Ingredient key={id} type='ingredient' id={id} caption={name} amount={amount} unit={unit}/>;
}

const ingredientData = [
    {
        type: 'ingredient',
        id: uuid(),
        name: 'Pasta',
        amount: 300,
        unit: 'g'
    },{
        type: 'ingredient',
        id: uuid(),
        name: 'Water',
        amount: null,
        unit: 'ml'
    },{
        type: 'ingredient',
        id: uuid(),
        name: 'Salt',
        amount: 1,
        unit: 'pinch',
    },
];

export default function Cookbook() {
    const [lanes, setLanes] = useState([]);
    const [stages, setStages] = useState([]);
    const [popupQueue, setPopupQueue] = useState([]);

    console.log("lanes");
    console.log(lanes);

    function closePopup() {
        setPopupQueue(queue => queue.slice(1));
    };

    const ingredients = ingredientData.map(createIngredientComponent);
    
    function handleDrop(item, stageId) {
        console.log(item);
        if (!stageId) {
            // new stage being created
            setPopupQueue(queue => [...queue, {
                newStage: {
                    stageName: '',
                    stageDuration: 0,
                    addIngredients: {
                        [item.caption]: {
                            amount: 0
                        }
                    },
                    Add: (formResult) => {
                        console.log(formResult);
                        setStages(prevStages => [...prevStages, {
                            id: uuid(),
                            caption: formResult.stageName,
                            ingredients: [
                                {
                                    id: item.id,
                                    amount: formResult.addIngredients[item.caption].amount
                                }
                            ]
                        }]);
                        closePopup();
                    }
                }
            }]);
            return;
        }
    };

    function newLane(item, laneId) {
        console.log(item);
        switch (item.type) {
            case 'ingredient':
                const newStageCaption = window.prompt("New stage caption");
                setLanes(prevLanes => [...prevLanes, {
                    id: uuid(),
                    stages: [{
                        id: uuid(),
                        caption: newStageCaption,
                        items: [{...item}]
                    }],
                }]);
                break;
            case 'stage':
                setLanes(prevLanes => [...prevLanes, {
                    id: uuid(),
                    stages: [
                        {...item}
                    ]
                }]);
                break;
            default:
                return;
        }
    };

    const currentPopup = popupQueue[0] && popupQueue[0];
    // console.log(stages);

    return (
        <div className={styles.body}>   
            <div key={uuid()} className={styles.ingredients}>
                {ingredients}
            </div>

            <div className={styles.lanes}>
                {lanes.map((lane, laneIndex) => {
                    return <div key={lane.id}>
                        {lane.stages.map(stage => {
                            return <Group
                                key={stage.id}
                                id={stage.id}
                                caption={stage.caption}
                                items={stage.items}
                                onChange={(newValue) => {
                                    console.log("onchange");
                                    console.log(newValue);
                                    setLanes(prevLanes => prevLanes.map(
                                        prevLane => prevLane.id === lane.id
                                            ? {
                                                ...prevLane,
                                                stages: prevLane.stages.map(
                                                    prevStage => prevStage.id === stage.id
                                                        ? newValue
                                                        : prevStage
                                                )
                                            }
                                            : prevLane
                                    ))
                                }}
                            />
                        })}
                    </div>;
                })}

                <div className='newLane'>
                    <CookingStage key='newLane' onDrop={newLane}/>
                </div>
            </div>

            {popupQueue.length > 0 && <Popup key={JSON.stringify(currentPopup)}>
                <Form key='asdf' data={currentPopup}/>
            </Popup>}
        </div>
    );
};