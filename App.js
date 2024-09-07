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

const App = () => {
    // tasks is complete data without filtering, use for saving data to local storage
    const [tasks, setTasks] = useState([]);

    // filtered Task is filtered data, use for display to UI
    const [filteredTasks, setFilteredTasks] = useState([]);

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
            filterData();
        }
    }, [filter])


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
                setEditItem(null)
                storeData();
            } else {
                // Add new task
                const updatedTasks = [...tasks, {isCompleted: false, name: taskName }];
                const updatedFilteredTasks = [...filteredTasks, {isCompleted: false, name: taskName }];

                setTasks(updatedTasks);
                setFilteredTasks(updatedFilteredTasks);
                storeData();
            }
            setTaskName("");
        }
    };

    const handleEditTask = (index, item) => {
        // setTaskName(filteredTasks[index].name);
        setTaskName(item.name);
        setEditItem(item)
    };

    const handleDeleteTask = (index, item) => {
        const updatedTasks =  tasks.filter((data)=> data.name !== item.name );
        const updatedFilteredTasks =  tasks.filter((data)=> data.name !== item.name );

        setTasks(updatedTasks);
        setFilteredTasks(updatedFilteredTasks);
        storeData()
    };

    const renderItem = ({ index, item }) => (
        <View style={styles.task}>
            
            <View style={styles.checkboxContainer}>
                <CheckBox
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
                        return storeData()
                    }}
                    style={styles.checkbox}
                />
                {/* <Text style={styles.label}>{item.isCompleted ? "Completed":"Incomplete"}</Text> */}
            </View>

            <View style={styles.itemList}
                ><Text style={styles.textNote}>{item.name}</Text>
            </View>
            
            <View
                style={styles.taskButtons}>
                <TouchableOpacity
                    onPress={() => handleEditTask(index, item)}>
                    <Text
                        style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleDeleteTask(index, item)}>
                    <Text
                        style={styles.deleteButton}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
            <PaperProvider>
                <ToastManager />
                <View style={styles.container}>
                    <Text style={styles.title}>Simple ToDo App</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter task"
                        value={taskName}
                        onChangeText={(text) => setTaskName(text)}
                    />
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleAddTask}>
                        <Text style={styles.addButtonText}>
                            {editItem !== null ? "Update Task" : "Add Task"}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.line} />

                    <View style={styles.dropdownContainer}>
                        <Dropdown
                            label="Select Options..."
                            placeholder="Select Filter"
                            options={OPTIONS}
                            value={filter}
                            onSelect={setFilter}
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
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        fontSize: 18,
    },
    addButton: {
        backgroundColor: "green",
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    addButtonText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 18,
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
        fontSize: 14,
        // border: 1,
        // borderWidth: 1
    },
    itemList: {
        flexGrow: 1,
        marginHorizontal: 10,
        // border: 1,
        // borderWidth: 1
    },

    textNote: {
        fontSize: 14,
    },
    taskButtons: {
        flexDirection: "row",
    },
    editButton: {
        marginRight: 10,
        color: "green",
        fontWeight: "bold",
        fontSize: 14,
    },
    deleteButton: {
        color: "red",
        fontWeight: "bold",
        fontSize: 14,
    },
    checkboxContainer: {
        flexDirection: 'row',
    },
    checkbox: {
        alignSelf: "center"
    },
    label: {
        margin: 8,
        textAlign: "left"
    },
    dropdownContainer: {
        backgroundColor: "#fff",
        marginVertical: 20
    },
    selectOption: {
        color: "#000"
    }
});

export default App;