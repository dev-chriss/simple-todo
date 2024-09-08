import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from "react-native";

// checkbox
import CheckBox from "expo-checkbox";

// async storage
import AsyncStorage from "@react-native-async-storage/async-storage";

// dropdown
import { Dropdown } from 'react-native-paper-dropdown';
import { Provider as PaperProvider } from 'react-native-paper';

// toast/popup message
import ToastManager, { Toast } from "expo-react-native-toastify";

// confirm dialog
import { ConfirmDialog } from 'react-native-simple-dialogs';

const App = () => {
    // completed data without filtering, used for saving to local storage
    const [tasks, setTasks] = useState([]);

    // filtered data, used for display to UI
    const [filteredTasks, setFilteredTasks] = useState([]);

    const [showDialog, setShowDialog] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);
    const [taskName, setTaskName] = useState("");
    const [editItem, setEditItem] = useState(null);
    const [filter, setFilter] = useState("all")
    const OPTIONS = [
        { label: 'All', value: 'all' },
        { label: 'Completed', value: 'completed' },
        { label: 'Incomplete', value: 'incomplete' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            const value = await AsyncStorage.getItem('todo');
            // console.log("getData", value)

            if (value !== null) {
                const objValue = JSON.parse(value)
                setTasks(objValue)
                setFilteredTasks(objValue)
            }
            else {
                setTasks([])
                setFilteredTasks([])
            }
        }
        fetchData();
    }, [])

    useEffect(() => {
        if (filter !== null && tasks !== null) {

            const filterData = async () => {
                const filteredTasks = tasks.filter(item => {
                    if (filter === 'completed' && item.isCompleted) {
                        return item
                    }
                    else if (filter === 'incomplete' && !item.isCompleted) {
                        return item
                    } 
                    else if (filter === 'all') {
                        return item
                    }
                })
                setFilteredTasks(filteredTasks)
            }
            setEditItem(null);
            setTaskName("");
            filterData();
        }
    }, [filter])

    useEffect(() => {
        storeData()
    }, [tasks])

    const storeData = async () => {
        try {
            const jsonValue = JSON.stringify(tasks);
            await AsyncStorage.setItem('todo', jsonValue);
            Toast.success("Data berhasil diperbaharui");
        } catch (e) {
            Toast.error("Data gagal diperbaharui");
        }
    };

    const handleAddTask = () => {
        if (taskName !== "" && taskName !== undefined) {
            if (editItem !== null) {
                // Edit existing task
                const updatedTasks = tasks.map(obj =>
                    obj.name === editItem.name ? { ...obj, name: taskName } : obj
                );
                const updatedFilteredTasks = filteredTasks.map(obj =>
                    obj.name === editItem.name ? { ...obj, name: taskName } : obj
                );

                setTasks(updatedTasks);
                setFilteredTasks(updatedFilteredTasks);
                setEditItem(null);
            } else {
                // Add new task
                const updatedTasks = [...tasks, {name: taskName , isCompleted: false }];
                const updatedFilteredTasks = [...filteredTasks, {name: taskName , isCompleted: false }];

                setTasks(updatedTasks);
                setFilteredTasks(updatedFilteredTasks);
            }
            setTaskName("");
        }
    };

    const handleEditTask = (item) => {
        // setTaskName(filteredTasks[index].name);
        setTaskName(item.name);
        setEditItem(item);
    };

    const handleCancelTask = () => {
        setEditItem(null);
        setTaskName("");
    }

    const handleDeleteTask = (item) => {
        // if not edit mode
        // if (editItem === null) {
            setDeleteItem(item);
            setShowDialog(true);
        // }
    };

    const deleteTask = () => {
        if (deleteItem !== null) {
            const updatedTasks =  tasks.filter((data)=> data.name !== deleteItem.name );
            const updatedFilteredTasks =  filteredTasks.filter((data)=> data.name !== deleteItem.name );

            setTasks(updatedTasks);
            setFilteredTasks(updatedFilteredTasks);
            setEditItem(null);
            setTaskName("");
            setDeleteItem(null);
        }
        setShowDialog(false);
    };

    const renderItem = ({ index, item }) => (
        <View style={styles.task}>
            
            <View style={styles.checkboxContainer}>
                <CheckBox
                    disabled={editItem !== null}
                    value={item.isCompleted}
                    onValueChange={(value) => {
                        const updatedTasks = tasks.map(obj =>
                            obj.name === item.name ? { ...obj, isCompleted: value } : obj
                        );
                        const updatedFilteredTasks = filteredTasks.map(obj =>
                            obj.name === item.name ? { ...obj, isCompleted: value } : obj
                        );
                        
                        setTasks(updatedTasks)
                        setFilteredTasks(updatedFilteredTasks);
                        setEditItem(null);
                        setTaskName("");
                        return
                    }}
                    style={styles.checkbox}
                />
                {/* <Text style={styles.label}>{item.isCompleted ? "Completed":"Incomplete"}</Text> */}
            </View>

            <View style={styles.itemList}
                ><Text style={item.isCompleted ? styles.textNoteComplete : styles.textNote}>{item.name}</Text>
            </View>
            
            <View style={styles.taskButtons}>
                <TouchableOpacity
                    disabled={editItem !== null}
                    onPress={() => handleEditTask(item)}>
                    <Text
                        style={editItem !== null ? styles.disabledButton : styles.editButton}>
                            Edit
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={editItem !== null}
                    onPress={() => handleDeleteTask(item)}>
                    <Text
                        style={editItem !== null ? styles.disabledButton : styles.deleteButton}>
                            Delete
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
            <PaperProvider>
                <ToastManager />

                <ConfirmDialog
                    title="Confirm Dialog"
                    message="Are you sure want to delete?"
                    visible={showDialog}
                    onTouchOutside={() => setShowDialog(false)}
                    positiveButton={{
                        title: "YES",
                        onPress: () => {
                            deleteTask()
                        }
                    }}
                    negativeButton={{
                        title: "NO",
                        onPress: () => setShowDialog(false)
                    }}
                />

                <View style={styles.container}>
                    <Text style={styles.title}>Simple ToDo App</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter task"
                        value={taskName}
                        onChangeText={(text) => setTaskName(text)}
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleAddTask}>
                            <Text style={styles.addButtonText}>
                                {editItem !== null ? "Update Task" : "Add Task"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancelTask}>
                            <Text style={styles.addButtonText}> 
                                {editItem !== null ? "Cancel" : "Clear"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.line} />

                    <View style={styles.dropdownContainer}>
                        <Dropdown
                            disabled={editItem !== null}
                            label="Select Options..."
                            placeholder="Select Filter"
                            options={OPTIONS}
                            value={filter}
                            onSelect={setFilter}
                            mode="outlined"
                        />
                    </View>

                    <FlatList
                        data={filteredTasks}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
            </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginTop: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    heading: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 7,
        color: "green",
    },
    input: {
        borderWidth: 3,
        borderColor: "#ccc",
        paddingVertical: 5,
        paddingHorizontal: 12,
        marginBottom: 10,
        borderRadius: 10,
        fontSize: 14,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: "space-evenly",
        alignItems: "center",
        marginTop: 5,
        marginBottom: 20,
    },
    addButton: {
        backgroundColor: "green",
        width: "45%",
        padding: 10,
        borderRadius: 5,
    },
    addButtonText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
    cancelButton: {
        backgroundColor: "green",
        width: "45%",
        padding: 10,
        borderRadius: 5,
    },
    line: {
        borderBottomColor: 'black',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    task: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
        // border: 1,
        // borderWidth: 1
    },
    itemList: {
        flexGrow: 1,
        maxWidth: "70%",
        marginHorizontal: 10,
        // border: 1,
        // borderWidth: 1
    },

    textNote: {
        fontSize: 14,
        textDecorationLine: "none"
    },
    textNoteComplete: {
        textDecorationLine: "line-through"
    },
    taskButtons: {
        flexDirection: "row",
        width: "25%",
        justifyContent: "space-around",
        alignItems: "center",
    },
    editButton: {
        // marginRight: 10,
        color: "green",
        fontWeight: "bold",
        fontSize: 14,
    },
    deleteButton: {
        color: "red",
        fontWeight: "bold",
        fontSize: 14,
    },
    disabledDeleteButton: {
        color: "#ccc",
    },
    checkboxContainer: {
        flexDirection: 'row',
        width: "5%"
    },
    checkbox: {
        alignSelf: "center"
    },
    label: {
        margin: 8,
        textAlign: "left",
        
    },
    dropdownContainer: {
        backgroundColor: "#fff",
        marginVertical: 20,
        fontSize: 14,
    },
    selectOption: {
        fontSize: 14,
        color: "#000"
    }
});

export default App;