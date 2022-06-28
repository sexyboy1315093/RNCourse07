import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Alert, View, Button, Platform } from 'react-native';
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true
    }
  }
})

export default function App() {

  useEffect(() => {
    //권한
    async function configurePushNotifications(){
      const{ status } = await Notifications.getPermissionsAsync()
      let finalStatus = status

      if(finalStatus !== 'granted'){
        const{ status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if(finalStatus !== 'granted'){
        Alert.alert('Permission required', 'Push notifications need the appropriate permissions.')
        return
      }

      //토큰
      const pushTokenData = await Notifications.getExpoPushTokenAsync()
      console.log(pushTokenData)

      if(Platform.OS === 'android'){
        console.log('호출')
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT
        })
      }
    }
    configurePushNotifications()
  },[])

  //======================= 위에는 일반 Notification인데 에뮬레이터에서는 테스트 못한다 ===============================
  //======================= 밑에는 local Notification 모닝콜이나 TODO앱 만들때 =======================================

  useEffect(() => {
    //Notification 왔을때
    const subscription = Notifications.addNotificationReceivedListener((notification)=>{
      console.log(notification)
      const userName = notification.request.content.data.userName
      console.log(userName)
    })

    //Notification 클릭했을때
    const subscription2 = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response)
    })

    return () => {
      subscription.remove()
      subscription2.remove()
    }
  },[])

  function scheduleNotificationHandler(){
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'My first local Notification',
        body: 'This is the body of the notification',
        data: { userName: 'Max'}
      },
      trigger: {
        seconds: 5
      }
    })
  }

  function sendPushNotificationHandler(){
    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: '',
        title: 'Test - sent from a device',
        body: 'This is a test'
      })
    })
  }

  return (
    <View style={styles.container}>
      <Button title='Schedule Notification' onPress={scheduleNotificationHandler}/>
      <Button title='Send push Notification' onPress={sendPushNotificationHandler}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
