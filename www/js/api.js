angular.module('app')
    .factory('config', [function () {
        return {
            lendTime: 14,
            extendLendTime: 7
        }
    }])
    .service('api', ['$q', '$firebaseArray', '$http', 'config', function ($q, $firebaseArray, $http, config) {
        var ref = firebase.database().ref();

        return {
            getMyLend: function (user) {
                console.log(user);
                
                var q = $q.defer();
                var lended = $firebaseArray(
                    ref.child('lend')
                        .orderByChild('uid')
                        .equalTo(firebase.auth().currentUser ? firebase.auth().currentUser.uid : user.uid)
                    // .orderByChild('returned')
                    // .equalTo(false) 
                );
                lended.$loaded().then(function (s) {
                    q.resolve(s);
                })
                return q.promise;
            },
            getUserInfo: function (user) {
                var q = $q.defer();
                var lended = $firebaseArray(
                    ref.child('users')
                        .orderByChild('uid')
                        .equalTo(firebase.auth().currentUser.uid)
                    // .orderByChild('returned')
                    // .equalTo(false) 
                );
                lended.$loaded().then(function (s) {
                    q.resolve(s[0]);
                })
                return q.promise;
            },
            addUser: function (u) {
                var q = $q.defer();
                var user = {
                    uid: u.uid,
                    providerData: u.providerData[0],
                    displayName: u.displayName,
                    email: u.email,
                    photoURL: u.photoURL,
                    lastlogin: moment().format(),
                    created: moment().format()
                }

                firebase.database().ref('/users/' + u.uid).once('value').then(function (snapshot) {
                    if (snapshot.val() && snapshot.val().uid) {
                        var updates = {};
                        updates['/users/' + u.uid + '/lastlogin'] = moment().format();
                        firebase.database().ref().update(updates);
                        q.resolve()
                    } else {
                        var updates = {};
                        updates['/users/' + u.uid] = user;
                        firebase.database().ref().update(updates);
                        q.resolve()
                    }
                });

                return q.promise;
            },
            getEvents: function () {
                var q = $q.defer();
                var events = $firebaseArray(ref.child('events').orderByChild('start'));
                events.$loaded().then(function (s) {
                    q.resolve(events);
                })
                return q.promise;
            },
            cantGoEvent: function (evnt, user) {
                var q = $q.defer();
                ref.child('events').child(evnt.$id).child('participants').child(user.uid).remove();
                q.resolve();
                return q.promise;
            },
            goEvent: function (evnt, user) {
                var q = $q.defer();
                console.log(evnt);

                var participants = ref.child('events').child(evnt.$id).child('participants');
                firebase.database().ref('/events/' + evnt.$id + '/participants/' + user.uid).once('value')
                .then(function (snapshot) {
                    if (snapshot.val() && snapshot.val().uid) {
                        q.reject("User exist");
                    } else {
                        var u = {};
                        u[user.uid] = user;
                        participants.update(u);
                        q.resolve(s);
                    }
                })
                // event.$save(user)
                //     .then(function (s) {
                //         q.resolve(s);
                //     })
                //     .catch(function (e) {
                //         console.log(e);
                        
                //     })

                return q.promise;
            },
            addEvent: function (evnt) {
                var q = $q.defer();
                var event = {
                    title: evnt.title,
                    desc: evnt.desc,
                    cover: evnt.cover || 'https://scontent.fskp1-1.fna.fbcdn.net/v/t39.5549-6/s2048x2048/12409802_989808747728106_1038253242_n.jpg?_nc_cat=102&_nc_ht=scontent.fskp1-1.fna&oh=de7105cf2ce786097e58200e27d46b06&oe=5CA483DF',
                    start: evnt.entireDay ?
                        moment(evnt.startDate).format('YYYY-MM-DD') :
                        moment(moment(evnt.startDate).format('YYYY-MM-DD') + " " + moment(evnt.startTime).format('HH:mm:ss')).format(),
                    private: evnt.private,
                    location: evnt.location || '',
                    created: moment().format()
                }
                if (evnt.isEnd && evnt.endDate) {
                    event.end = event.endTime ?
                        moment(moment(evnt.endDate).format('YYYY-MM-DD') + " " + moment(evnt.endTime).format('HH:mm:ss')).format() :
                        moment(evnt.endDate).format('YYYY-MM-DD');
                }
                console.log(event);

                var events = $firebaseArray(ref.child('events'));
                events.$add(event)
                    .then(function (s) {
                        q.resolve(s);
                    })
                return q.promise;
            },
            getBooks: function () {
                var q = $q.defer();
                var books = $firebaseArray(ref.child('books').orderByChild('title'));
                books.$loaded().then(function (s) {
                    q.resolve(s);
                })
                return q.promise;
            },
            getLendedBooks: function () {
                var q = $q.defer();
                var books = $firebaseArray(ref.child('lend').orderByChild('returned').equalTo(false));
                books.$loaded().then(function (s) {
                    // var books = $firebaseArray(ref.child('books').orderByChild('lended').equalTo(true));
                    q.resolve(s);
                })
                return q.promise;
            },
            lendBook: function (book, user) {
                var q = $q.defer();
                if (book.lended === true) q.reject();

                var lend = {
                    book: book,
                    bookId: book.$id,
                    userId: user.name,
                    user: user,
                    extended: false,
                    returned: false,
                    lendDate: moment().format(),
                    returnDate: moment().add(config.lendTime, 'day').format()
                }
                var lended = $firebaseArray(ref.child('lend'));
                lended.$add(lend)
                    .then(function (s) {
                        ref.child('books').child(book.$id).update({ lended: true })
                        q.resolve(s);
                    })
                return q.promise;
            },
            returnLend: function (lend) {
                var q = $q.defer();
                ref.child('books').child(lend.bookId).update({ lended: false })
                ref.child('lend').child(lend.$id).update({ returned: true })
                q.resolve();
                return q.promise;
            },
            requestBorrow: function (book, user) {
                var q = $q.defer();
                if (!book.lended) {
                    var not = {
                        created: moment().format(),
                        notificationType: 'requestBorrow',
                        book: book,
                        user: user,
                        bid: book.$id
                    };
                    var notifications = $firebaseArray(ref.child('notifications').child('admin'));
                    notifications.$add(not)
                    .then(function (s) {
                        q.resolve(s);
                    })
                    .catch(function (e) {
                        console.log(e);
                        
                    })

                }
                else {
                    q.reject(`Can't extend lending`);
                }
                return q.promise;
            },
            requestForExtend: function (lend) {
                var q = $q.defer();
                if (!lend.extend) {
                    var not = {
                        created: moment().format(),
                        notificationType: 'requestExtend',
                        lend: lend,
                        lid: lend.$id
                    };
                    var notifications = $firebaseArray(ref.child('notifications').child('admin'));
                    notifications.$add(not)
                    .then(function (s) {
                        ref.child('lend').child(lend.$id).update({ requested: true })
                        q.resolve(s);
                    })

                }
                else {
                    q.reject(`Can't extend lending`);
                }
                return q.promise;
            },
            extendLend: function (lend) {
                var q = $q.defer();
                if (!lend.extend) {
                    ref.child('lend').child(lend.$id).update({ extend: true })
                    ref.child('lend').child(lend.$id).update({ returnDate: moment(lend.returnDate).add(config.extendLendTime, 'day').format() })
                    q.resolve();
                }
                else {
                    q.reject(`Can't extend lending`);
                }
                return q.promise;
            },
            getUserNotifications: function (params) {
                var q = $q.defer();
                var notifications = $firebaseArray(
                    ref.child('notifications').child(firebase.auth().currentUser.uid)
                        // .orderByChild('uid')
                        // .equalTo(firebase.auth().currentUser.uid)
                    // .orderByChild('returned')
                    // .equalTo(false) 
                );
                notifications.$loaded().then(function (s) {
                    q.resolve(s);
                })
                return q.promise;
            },
            saveNotification: function (n,u) {
                var q = $q.defer();
                var notification = {
                        readed: false,
                        created: moment().format(),
                        title: n.title,
                        message: n.message

                }
                var notifications = ref.child('notifications').child(u.uid).push(notification);
                if(notifications) q.resolve(s);
                return q.promise;
            },
            sendNotification: function (lend, template) {
                var q = $q.defer();
                var notification = {
                    data: {
                        lend: lend,
                        lid: lend.$id,
                        uid: lend.uid,
                        readed: false,
                        sendDate: moment().format(),
                        template: template
                    }
                }

                var notifications = $firebaseArray(ref.child('notifications'));
                notifications.$add(notification)
                    .then(function (s) {
                        q.resolve(s);
                    })
                return q.promise;
            },
            getUsers: function () {
                var q = $q.defer();
                q.resolve(users);
                return q.promise;
            }
        };
    }])
