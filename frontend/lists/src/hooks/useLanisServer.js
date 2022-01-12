import { useState, useEffect } from 'react';
import fetchLanis from '../functions/fetchLanis';
import { useDev } from '../contexts/DevContext';

export default function useLanisServer({type, filter, jwt, refreshRate}) {
    const [localRecords, setLocalRecords] = useState([]);
    const [serverRecords, setServerRecords] = useState([]);
    const [createdRecords, setCreatedRecords] = useState([]);
    const [updatedRecords, setUpdatedRecords] = useState([]);
    const [deletedRecords, setDeletedRecords] = useState([]);
    const [lastRefresh, setLastRefresh] = useState(0);

    const devMode = useDev();

    useEffect(() => {
        // console.log("Init side effect");
        async function selectRecords() {
            // console.log(`Server refresh: ${type} - ${filter}`);
            setLastRefresh(Date.now());
            const serverResponse = await fetchLanis({
                jwt: jwt,
                action: "select",
                type: type,
                filter: filter
            }, devMode);
            // console.log(`selectRecords: status = ${serverResponse.status}`);
            if (serverResponse.status === 200) {
                const parsedResponse = await serverResponse.json();
                // console.log(`selectRecords: selected ${parsedResponse.length} records`)
                setServerRecords([...parsedResponse]);
            }
        }

        selectRecords();

        const refreshInterval = setInterval(selectRecords, refreshRate);
        return () => clearInterval(refreshInterval);
        
        // eslint-disable-next-line
    }, [filter]);

    useEffect(() => {
        // console.log(`serverRecords side effect: length = ${serverRecords.length}`);
        setLocalRecords(prevRecords => {
            let t = [...serverRecords.map(serverRecord => {
                let matchingPrevious = prevRecords.find(prevRecord => prevRecord.id === serverRecord.id);
                return matchingPrevious && matchingPrevious.modified > serverRecord.modified ? matchingPrevious : serverRecord;
            }), ...prevRecords.filter(prevRecord => prevRecord.modified > lastRefresh && !serverRecords.find(s => s.id === prevRecord.id))];
            return t;
        });

        // eslint-disable-next-line
    }, [serverRecords]);

    useEffect(() => {
        // console.log(localRecords);
        // console.log(`localRecords side effect: length = ${localRecords.length}`);
        setCreatedRecords(
            localRecords.filter(
                local => !!!serverRecords?.find(
                    server => server.id === local.id
                )
            )
        );
        setUpdatedRecords(
            [...localRecords.filter(
                local => !!serverRecords.find(
                    server => {
                        return server.id === local.id && local.modified > server.modified;
                    }
                )
            )]
        );
        // setDeletedRecords(
        //     serverRecords.filter(
        //         server => !localRecords.find(
        //             local => local.id === server.id
        //         )
        //     )
        // );

        // eslint-disable-next-line
    }, [localRecords]);

    useEffect(() => {
        if (!!!createdRecords.length) return;
        // console.log(`createdRecords side effect: length = ${createdRecords.length}`);

        async function createRecords() {
            await fetchLanis({
                jwt: jwt,
                action: "insert",
                type: type,
                payload: [...createdRecords]
            }, devMode);
        }

        createRecords();
        setCreatedRecords([]);

        // eslint-disable-next-line
    }, [createdRecords]);

    useEffect(() => {
        if (!!!updatedRecords.length) return;
        // console.log(`updatedRecords side effect: length = ${updatedRecords.length}`);

        async function updateRecords() {
            let r = await fetchLanis({
                jwt: jwt,
                action: "update",
                type: type,
                payload: [...updatedRecords]
            }, devMode);
            // let p = await r.text();
            // console.log(p);
        }

        updateRecords();
        setUpdatedRecords([]);

        // eslint-disable-next-line
    }, [updatedRecords]);

    // useEffect(() => {
    //     if (!!!deletedRecords.length) return;
    //     // console.log(`deletedRecords side effect: length = ${deletedRecords.length}`);

    //     async function deleteRecords() {
    //         await fetchLanis({
    //             jwt: jwt,
    //             action: "delete",
    //             type: type,
    //             payload: [...deletedRecords]
    //         }, devMode);
    //     }

    //     deleteRecords();
    //     setDeletedRecords([]);

    //     // eslint-disable-next-line
    // }, [deletedRecords]);

    return [localRecords, setLocalRecords];
}