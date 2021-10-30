const socket = io()

//Ele
const $messageForm = document.querySelector('#message-form')
const $messageFormInpt = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Template
const messageTem = document.querySelector('#message-template').innerHTML
const locationTem = document.querySelector('#location-message-template').innerHTML
const sidebarTem = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// 自动滚动
const autoScroll = () => {
    // 最新消息元素
    const $newMessage = $messages.lastElementChild

    // 新消息高
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    // 可见高
    const visibleHeight = $messages.offsetHeight

    // 总消息高
    const containerHeight = $messages.scrollHeight
   
    // 滚动方法
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight >= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTem, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData',({ room, users }) => {
    const html = Mustache.render(sidebarTem, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationTem, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled') //点击后设置不可用，防止重复点击

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (err) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInpt.value = ''
        $messageFormInpt.focus() //将光标定位到表单输入处
        if (err) {
            return console.log(err)
        }
        console.log('Message delivered')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser")
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared')
        })

    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})