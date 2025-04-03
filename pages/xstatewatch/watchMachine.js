import { createMachine, assign } from "xstate";
import { DateTime, Duration } from "luxon";

export const watchMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QBECWVUBcCGAbA6tpgMYAWAxAMIAyA8pQNIAqAkowNoAMAuoqAA4B7WFlSCAdnxAAPRAA4AjJwB0AFlUBmAJyqFAdj2c5ANgUAmADQgAnonMBfe1bQYcBImWUA5QQCcAtngAsoIQYOQAgrjYAUyo-mBcvEggQiKYYpIpsggKqorKGpxacqpaCjpmpnpWtggaZYVaenmqnC0ArJxmWo7O6Fh4hCSk3n6BuCFhymiw-NHW5ACqAApJUmmiElI5Cua1iGacusodxqbtRgoaenIdfSAug+4jYwHBoWAzqHMLynEJcgAUQAypR1ilNhlttk7AoOh1lC1ipwNB08uctBoDgg5CVlMZOMYOqozNodAjek5HgM3MNPD53pNPt9fthrP94uEQUCmBCBMItllQLtujiNMY5Mo5KiNHI5GS9GZ1MYNA8nnSPKNGRMpl9ZvN2TMiOFQeCeBtBdDhTI4SZlN0Go74WYqsYcUozFLOAi9FoOqV0cYqf1XEMtW9dSyDX9kCbyDy+RbIVbMjs4ZYbIhdFLTB09OozsGzAo5OraeHXjqPtMY0a45hwtJYDhG8psAAzRu+AAUXU4nAAlOQNZWGeMa-qfoaOQ3EsmBek07DcvDEcitKj0apMdis7j0dLOKXN+Y9Krj+Wwy9x0y9ayZ8oojF-MCwfzUqmYSLEOU9Mp-WOORz3zEtihxEwVFKfIDH9PQikUK9nnpbUJ2ZWtpz+Z8AgTXkPyhZcf1yMV91dBVTlJJUNCqcw5T0JDNSrND7zrDlsNfZtWy+Ttuz7AchxHCsb1Qu9o0wo12Pwr8bRyP8AK6GDiSVJQtBxcoVCU6iNDlBVjlUBixxEqNpgBMBfDfc1kkXIV0wQDobgJdFj1uPEzBaVQPWA1RCgRMkjh0JRSQM4TI0nTkEl8ZQQUwQR+H4SBljWBdPyXb9bQQNyzFObS5B0kpjAMd191LdQ1DKAcsVuYkA2ClDQvQr5TMi6LYviiBcKTKyUpsld4WMaU9lLEwJS0coEQ9AsFGlXy+uLDpmlqiNqwa8KzKimK4oSziTXbLszJ7JR+OHUcQuW+8mvW1rICk1KZMQez-2JJR9HlLQ3LyD03u8hQCoKvQOjMfsfUWpjRJMrlIoAcUEVBxCgRKbp6ojMuyuU8pMQqJp0AkJTObRVAMeazBB29jMaiHlGh2H4ZoehmDYBhEetWy0X-O4sVMUllVUAGJqJAknq0Ux5WPMkSaMsLKFIbA4bAUzlClmWYAACUEABXczEyZwj0qKLKWk5zR9GMMpiQ9doppuEwznyRQFXo6kTrqs6WUV2X5bdlX1fM1ZtbS3ZTAAx0SRJc4Azc83yPheCukJUkFTVR2hOd5jXel92uQV9OvY18htrbHj9qB47k6W1Ppk9uXM8r1WNb9u67OaHG-UJLFoK9D1zCy0slXyZVjyKEMaWvFOwa+SuPezsAglhtXG1gDr65Z7okR+1oNGN02OnNktTnOcwAbOPZXXF+r7wn6up5n8Q57gBHkoI-3s0B5RlRMSVz3OQGPP3ZoNCRUogFXSjVysTJOI8y5jyzkrKuCRoGy2vrfBe+duJ7V7MXQSEDQZk3gTASeMDEHzyXiueaj0bhC2KHKdQHdirtERHKQG-oha5R9GA0MyFIE4MrnOXB08JCYAoFrB+0ll6IgqMeCqRQKjARxNVZQ5gLiA3mmUGq4COHYMllPHhlcQjiAEffLqj8G6kimliGCuhbjnjyNvfchJ-wNFtjuaisEyxqMYqTTRMDtFX34RQFBu1eIYKdpwzxstvEEN8cQoiAYpT2RNvCeEx5zg4kMFKSoCJSwlm0ADU+LsK5aJ2tw9ki9hG3VEfI08kjjwlBqPuQw3k26qnIbNfSbjDJnzTl4wpBTFi+1KUjdKP0pTXDeu-AGRQgIpPhKvJU55-rBnOLk8u48CltiKYsfxhd0FHUweojxK0ilrJ6VE9KMTsrxPRF0H6RU6j-XXATI4bQsSuj2EsqBld2K8NrprPC-TmYrj1qvQ2G9zxlFUsVTQbMe5oi9Aic4xg3lcKnp8mu3sDGWjKb1QOm4yQhx3MSUoHp1CxL-vKBJz1XHsPcRLA5yLogBC+WizZaC+IDhLlg-Z586UvkZXXP5OscikJxjKNoIyAaSiJfKAkbkRpt09Ii0JMAUVX1nvPEphiREApXgbdem9Roeh0g6IkjyfQNH9JS4eeyaVcpgcqghqq759I1ZioipJERvy-tc+ylyDVtFfsqEo6g5n5nuG006yzeF2oQQ65BLYdpbNZQJYJGjaW2vpf4XhhC4AnMFU3VUIqB7+iqHIIlJwFRVA3tbeVYa6rsTznGguLKgml1eJJflT87K1LqKWKa+ZFDHDJLlBJobqTiE+PAFIyayAYoGTkAAtJmOo2MlH+XaHmENCqGozv+a6m5hwCj5D0h-QsaNN0sXEnUayO70r-WGfC-yaJ7YpJNmoW4OgZTFrtmesSbIOSmW3QKuwRIVABiJB+0kwYPr7jxP1Yt-F4Xge-RhX9xpGwAY7dcIwhRdAqQmdpIk5tzDSi8mBB5XQ2GWupR05Dj52LoYbjKfq1zjAPvDl2oDyppSSgaBcNExQEU1pCStJq9HbKBQ9KYLQ2GXkVGVKqHJgmU3nQpi1TaEBRO9V5sVUo3dArKgLCSNcSHyYRUpjDOGGmiJyimiw9yJJ8rHD3N2xjAETXit0JKYzyhfBgEwBrcQAB9AA7qQMyYAAvWHVsFsLlnBntBxCWQkAEqI9BbgqAqXmL4JFi7JH+dR5T9R3EcEk1F8oOype0vJKyYH4Nlt8nLdhSSd3IrofTdE3qqiHlO61nSM5wJ0TGhr9QsRIlSXsRQ5RdBOaAwWB0or5pFFMNoTLqywBDfE-uAGKhujSOAtRc4NwVtdKOREvRpAhvaFg0GyURtgzHhSe0Ak-FKpGCxGcI7YTuldMvd1a9uwtP5emc0N+AZtLmFLB9pV6ahs6A9IDLKOKjB3E-lNyHYAo0518OtprxUSRSjuIwpUmU+1o4x9PQbKYXW6xGwYK4PbJvXFLSoQ9FQ0QA3KNpU+dHKezrsCxmzcEqhGBckqTyUoQXw+aCSKqI77BAA */
    context: {
        alarmTime: DateTime.now().plus({ minutes: 2 }),
        currentTime: DateTime.now(),
        timer: Duration.fromObject({ hours: 0, minutes: 0, seconds: 0 }),
    },
    id: "DigitalWatch",
    initial: "NormalMode",
    on: {
        CLOCKTICK: {
            actions: assign({
                currentTime: (context, event) => {
                    console.log(context.context);
                    return context.context.currentTime.plus({ seconds: 1 });
                },
            }),
        },
    },
    states: {
        NormalMode: {
            initial: "Display",
            states: {
                Display: {
                    initial: "Time",
                    states: {
                        Time: {
                            on: {
                                ESC: {
                                    target: "Date",
                                },
                                SET: {
                                    target: "#DigitalWatch.NormalMode.ChangeTime",
                                },
                            },
                        },
                        Date: {
                            after: {
                                5000: {
                                    target: "#DigitalWatch.NormalMode.Display.Time",
                                },
                            },
                            on: {
                                ESC: {
                                    target: "Alarm",
                                },
                                SET: {
                                    target: "#DigitalWatch.NormalMode.ChangeDate",
                                },
                            },
                        },
                        Alarm: {
                            after: {
                                5000: {
                                    target: "#DigitalWatch.NormalMode.Display.Time",
                                },
                            },
                            on: {
                                ESC: {
                                    target: "Time",
                                },
                                SET: {
                                    target: "#DigitalWatch.NormalMode.ChangeAlarm",
                                },
                            },
                        },
                    },
                    on: {
                        UP: {
                            target: "Timer",
                        },
                    },
                },
                Timer: {
                    initial: "Stopped",
                    states: {
                        Stopped: {
                            after: {
                                10000: {
                                    target: "#DigitalWatch.NormalMode.Display",
                                },
                            },
                            on: {
                                UP: {
                                    target: "Going",
                                },
                                SET: {
                                    actions: assign({
                                        timer: (context, event) => {
                                            console.log("resetting timer");
                                            return Duration.fromObject({
                                                hours: 0,
                                                minutes: 0,
                                                seconds: 0,
                                            });
                                        },
                                    }),
                                },
                            },
                        },
                        Going: {
                            on: {
                                UP: {
                                    target: "Stopped",
                                },
                                CLOCKTICK: {
                                    actions: assign({
                                        timer: (context, event) => {
                                            console.log("updating Timer seconds");
                                            return context.context.timer.plus({ seconds: 1 });
                                        },
                                    }),
                                },
                            },
                        },
                    },
                    on: {
                        ESC: {
                            target: "Display",
                        },
                    },
                
                },
                return_where_you_were: {
                    history: "deep",
                    type: "history",
                },
                ChangeTime: {
                    initial: "ChangeHour",
                    states: {
                        ChangeHour: {
                            after: {
                                5000: {
                                    target: "#DigitalWatch.NormalMode.Display.Time",
                                },
                            },
                            on: {
                                SET: {
                                    target: "ChangeMinutes",
                                },
                                UP: {
                                    reenter: true,
                                    actions: assign({
                                        currentTime: (context, event) => {
                                            console.log("updating Hour");
                                            return context.context.currentTime.plus({hours: 1});
                                        },
                                    }),
                                },
                            },
                        },
                        ChangeMinutes: {
                            after: {
                                5000: {
                                    target: "#DigitalWatch.NormalMode.Display.Time",
                                },
                            },
                            on: {
                                SET: {
                                    target: "ChangeHour",
                                },
                                UP: {
                                    reenter: true,
                                    actions: assign({
                                        currentTime: (context, event) => {
                                            console.log("updating Minutes");
                                            return context.context.currentTime.plus({
                                                minutes: 1,
                                            });
                                        },
                                    }),
                                },
                            },
                        },
                    },
                },
                ChangeDate: {
                    initial: "ChangeDay",
                    states: {
                        ChangeMonth: {
                            after: {
                                5000: {
                                    target: "#DigitalWatch.NormalMode.Display.Date",
                                },
                            },
                            on: {
                                SET: {
                                    target: "ChangeDay",
                                },
                                UP: {
                                    reenter: true,
                                    actions: assign({
                                        currentTime: (context, event) => {
                                            console.log("updating Month");
                                            return context.context.currentTime.plus({months: 1});
                                        },
                                    }),
                                },
                            },
                        },
                        ChangeDay: {
                            after: {
                                5000: {
                                    target: "#DigitalWatch.NormalMode.Display.Date",
                                },
                            },
                            on: {
                                SET: {
                                    target: "ChangeMonth",
                                },
                                UP: {
                                    reenter: true,
                                    actions: assign({
                                        currentTime: (context, event) => {
                                            console.log("updating Day");
                                            return context.context.currentTime.plus({days: 1});
                                        },
                                    }),
                                },
                            },
                        },
                    },
                },
                ChangeAlarm: {
                    initial: "ChangeHour",
                    states: {
                        ChangeHour: {
                            after: {
                                5000: {
                                    target: "#DigitalWatch.NormalMode.Display.Alarm",
                                },
                            },
                            on: {
                                SET: {
                                    target: "ChangeMinutes",
                                },
                                UP: {
                                    reenter: true,
                                    actions: assign({
                                        alarmTime: (context, event) => {
                                            console.log("updating Alarm hour");
                                            return context.context.alarmTime.plus({hours: 1});
                                        },
                                    }),
                                },
                            },
                        },
                        ChangeMinutes: {
                            after: {
                                5000: {
                                    target: "#DigitalWatch.NormalMode.Display.Alarm",
                                },
                            },
                            on: {
                                SET: {
                                    target: "ChangeHour",
                                },
                                UP: {
                                    reenter: true,
                                    actions: assign({
                                        alarmTime: (context, event) => {
                                            console.log("updating Timer minutes");
                                            return context.context.alarmTime.plus({ minutes: 1});
                                        },
                                    }),
                                },
                            },
                        },
                    },
                },                
            },
            on: {
                AlarmTime: {
                    target: "#DigitalWatch.Alarm",
                },
            },
        },
        Alarm: {
            after: {
                5000: {
                    target: "#DigitalWatch.NormalMode.return_where_you_were",
                },
            },
        },
    },
    predictableActionArguments: true,
    preserveActionOrder: true,
    services: {},
    guards: {},
    delays: {},
});
