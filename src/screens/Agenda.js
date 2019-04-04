import React, { Component } from 'react'
import moment from 'moment'
import 'moment/locale/pt-br'
import todayImage from '../../assets/imgs/today.jpg'
import Task from '../components/Task'
import commomStyles from '../commomStyles'
import Icon from 'react-native-vector-icons/FontAwesome'
import AddTasks from './AddTasks'
import ActionButton from 'react-native-action-button'
import {
    View,
    StyleSheet,
    Text,
    ImageBackground,
    FlatList,
    TouchableOpacity,
    Platform,
    AsyncStorage
} from 'react-native'

export default class Agenda extends Component {
    state = {
        tasks: [],
        visibleTasks: [],
        showDoneTasks: true,
        showAddTask: false,
    }

    addTask = task => {
        const tasks = [...this.state.tasks]
        tasks.push({
            id: Math.random(),
            desc: task.desc,
            estimateAt: task.date,
            doneAt: null
        })
        this.setState({ tasks, showAddTask: false }, this.filterTasks)
    }

    toggleFilter = () => {
        this.setState({showDoneTasks: !this.state.showDoneTasks}, this.filterTasks)
    }

    componentDidMount = async () => {
        const data = await AsyncStorage.getItem('tasks')
        const tasks = JSON.parse(data) || []
        this.setState({ tasks }, this.filterTasks)
    }

    filterTasks = () => {
        let visibleTasks = null
        if (this.state.showDoneTasks) {
            visibleTasks = [...this.state.tasks]
        } else {
            const pending = task => task.doneAt === null
            visibleTasks = this.state.tasks.filter(pending)
        }
        this.setState({visibleTasks})
        AsyncStorage.setItem('tasks', JSON.stringify(this.state.tasks))
    }

    togleTask = id => {
        const tasks = this.state.tasks.map(task => {
            if (task.id === id) {
                task.doneAt = task.doneAt ? null : new Date()
            }
            return task
        })
        this.setState({ tasks }, this.filterTasks)
    }

    onDelete = id => {
        const tasks = this.state.tasks.filter(task => task.id !== id)
        this.setState({ tasks }, this.filterTasks)
    }

    render() {
        return (
            <View style={styles.container}>
                <AddTasks isVisible={ this.state.showAddTask } onSave={this.addTask} onCancel={() => this.setState({ showAddTask: false })}></AddTasks>
                <ImageBackground source={todayImage} style={styles.background}>
                    <View style={styles.iconBar}>
                        <TouchableOpacity onPress= {this.toggleFilter}>
                            <Icon name={this.state.showDoneTasks ? 'eye' : 'eye-slash'} size={20} color={commomStyles.colors.secondary}></Icon>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.titleBar}>
                        <Text style={styles.title}>Hoje</Text>
                        <Text style={styles.subtitle}>{moment().locale('pt-br').format('ddd, D [de] MMMM [de] YYYY')}</Text>
                    </View>
                </ImageBackground>
                <View style={styles.taskContainer}>
                    <FlatList data={this.state.visibleTasks} keyExtractor={item => `${item.id}`} renderItem={({ item }) => <Task { ...item } togleTask={this.togleTask} onDelete={this.onDelete}/>}/>
                </View>
                <ActionButton buttonColor={commomStyles.colors.today} onPress={() => {this.setState({ showAddTask: true })}}>

                </ActionButton>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 3,
    },
    titleBar: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    title: {
        fontFamily: commomStyles.fontFamily,
        color: commomStyles.colors.secondary,
        fontSize: 50,
        marginLeft: 20,
        marginBottom: 10,
    },
    subtitle: {
        fontFamily: commomStyles.fontFamily,
        color: commomStyles.colors.secondary,
        fontSize: 20,
        marginLeft: 20,
        marginBottom: 30,
    },
    taskContainer: {
        flex: 7,
    },
    task: {

    },
    iconBar: {
        marginTop: Platform.OS === 'ios' ? 40 : 10,
        marginHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    }
})