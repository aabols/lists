import { useQuery, useMutation, useQueryClient } from 'react-query';

// const ormEndpoint = "http://www.lanis.co.uk/php/orm";
const ormEndpoint = "http://www.lanis.co.uk/php/lapi";

export default function useServerState(key, type, filter, jwt) {
    const queryClient = useQueryClient();
    // const {data: records} = useQuery(key, async () => {
    //     let serverResponse = await fetch(ormEndpoint, {
    //         method: "POST",
    //         headers: {"Content-Type": "application/json"},
    //         body: JSON.stringify({
    //             action: "select",
    //             payload: {
    //                 type: type,
    //                 filter: filter
    //             },
    //             jwt: ""
    //         })
    //     });
    //     let serverRecords = await serverResponse.json();
    //     return serverRecords;
    // });
    const {data: records} = useQuery(key, async () => {
        let serverResponse = await fetch(
            ormEndpoint, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    jwt: jwt,
                    action: "select",
                    type: type,
                    filter: filter
                })
            }
        );
        let serverRecords = await serverResponse.json();
        return serverRecords;
    });

    async function updateServer(newRecords) {
        let createRecords = newRecords.filter(newRecord => !!!records?.find(record => record.id === newRecord.id));
        let updateRecords = newRecords.filter(newRecord => !!records.find(record => {
            return record.id === newRecord.id && JSON.stringify(record) !== JSON.stringify(newRecord);
        }));
        let deleteRecords = records.filter(record => !newRecords.find(newRecord => newRecord.id === record.id));

        if (!!createRecords.length) {
            // await fetch(ormEndpoint, {
            //     method: "POST",
            //     headers: {"Content-Type": "application/json"},
            //     body: JSON.stringify({
            //         action: "insert",
            //         payload: {
            //             type: type,
            //             content: [...createRecords]
            //         },
            //         jwt: ""
            //     })
            // });
            await fetch(ormEndpoint, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    jwt: jwt,
                    action: "insert",
                    type: type,
                    payload: [...createRecords]
                })
            });
        }

        if (!!updateRecords.length) {
            // await fetch(ormEndpoint, {
            //     method: "POST",
            //     headers: {"Content-Type": "application/json"},
            //     body: JSON.stringify({
            //         action: "update",
            //         payload: {
            //             type: type,
            //             content: [...updateRecords]
            //         },
            //         jwt: ""
            //     })
            // });
            await fetch(ormEndpoint, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    jwt: jwt,
                    action: "update",
                    type: type,
                    payload: [...updateRecords]
                })
            });
        }

        if (!!deleteRecords.length) {
            // await fetch(ormEndpoint, {
            //     method: "POST",
            //     headers: {"Content-Type": "application/json"},
            //     body: JSON.stringify({
            //         action: "delete",
            //         payload: {
            //             type: type,
            //             content: [...deleteRecords]
            //         },
            //         jwt: ""
            //     })
            // });
            await fetch(ormEndpoint, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    jwt: jwt,
                    action: "delete",
                    type: type,
                    payload: [...deleteRecords]
                })
            });
        }

    }


    function refreshRecords() {
        queryClient.fetchQuery(key)
    }

    const mutation = useMutation( updateServer, {
        onMutate: async (newRecords) => {
            await queryClient.cancelQueries(key);
            const current = queryClient.getQueryData(key);
            queryClient.setQueryData(key, prevRecords => [...newRecords]);
            return { current };
        },
        onSettled: () => {
            queryClient.refetchQueries(key);
        }
    });

    return [records, mutation.mutate, refreshRecords];
}