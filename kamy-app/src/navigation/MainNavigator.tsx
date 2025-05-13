"use client"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { Home, Users, Bell, User } from "../components/Icons"
import { useTheme } from "../contexts/ThemeContext"

// Screens
import HomeScreen from "../screens/main/HomeScreen"
import GroupsScreen from "../screens/main/GroupsScreen"
import NotificationsScreen from "../screens/main/NotificationsScreen"
import ProfileScreen from "../screens/main/ProfileScreen"
import GroupDetailsScreen from "../screens/main/GroupDetailsScreen"
import TaskDetailsScreen from "../screens/main/TaskDetailsScreen"
import CreateTaskScreen from "../screens/main/CreateTaskScreen"
import CreateGroupScreen from "../screens/main/CreateGroupScreen"
import GroupMembersScreen from "../screens/main/GroupMembersScreen"
import AddMemberScreen from "../screens/main/AddMemberScreen"
import EditProfileScreen from "../screens/main/EditProfileScreen"
import SettingsScreen from "../screens/main/SettingsScreen"

// Types
import type {
  MainTabParamList,
  HomeStackParamList,
  GroupsStackParamList,
  NotificationsStackParamList,
  ProfileStackParamList,
} from "../types/navigation"

const Tab = createBottomTabNavigator<MainTabParamList>()
const HomeStack = createStackNavigator<HomeStackParamList>()
const GroupsStack = createStackNavigator<GroupsStackParamList>()
const NotificationsStack = createStackNavigator<NotificationsStackParamList>()
const ProfileStack = createStackNavigator<ProfileStackParamList>()

// Home Stack Navigator
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="GroupDetails" component={GroupDetailsScreen} />
      <HomeStack.Screen name="TaskDetails" component={TaskDetailsScreen} />
      <HomeStack.Screen name="CreateTask" component={CreateTaskScreen} />
      <HomeStack.Screen name="GroupMembers" component={GroupMembersScreen} />
      <HomeStack.Screen name="AddMember" component={AddMemberScreen} />
    </HomeStack.Navigator>
  )
}

// Groups Stack Navigator
const GroupsStackNavigator = () => {
  return (
    <GroupsStack.Navigator screenOptions={{ headerShown: false }}>
      <GroupsStack.Screen name="GroupsMain" component={GroupsScreen} />
      <GroupsStack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <GroupsStack.Screen name="GroupDetails" component={GroupDetailsScreen} />
      <GroupsStack.Screen name="TaskDetails" component={TaskDetailsScreen} />
      <GroupsStack.Screen name="CreateTask" component={CreateTaskScreen} />
      <GroupsStack.Screen name="GroupMembers" component={GroupMembersScreen} />
      <GroupsStack.Screen name="AddMember" component={AddMemberScreen} />
    </GroupsStack.Navigator>
  )
}

// Notifications Stack Navigator
const NotificationsStackNavigator = () => {
  return (
    <NotificationsStack.Navigator screenOptions={{ headerShown: false }}>
      <NotificationsStack.Screen name="NotificationsMain" component={NotificationsScreen} />
      <NotificationsStack.Screen name="GroupDetails" component={GroupDetailsScreen} />
      <NotificationsStack.Screen name="TaskDetails" component={TaskDetailsScreen} />
    </NotificationsStack.Navigator>
  )
}

// Profile Stack Navigator
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  )
}

// Main Tab Navigator
const MainNavigator = () => {
  const { theme } = useTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarLabelStyle: {
          fontFamily: "SpaceGrotesk_500Medium",
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  )
}

export default MainNavigator
