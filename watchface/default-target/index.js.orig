var SCREEN_W = 390
var SCREEN_H = 450
var DEFAULT_STEP_GOAL = 10000
var LOW_BATTERY_PERCENT = 20

var BLACK = '0xFF000000'
var PROGRESS_COMPLETE = '0xFF808080'
var PROGRESS_TRACK = '0xFF333333'

// The Bip 6 has a 390 x 450 active area with a pronounced rounded display mask.
// Keeping the ring 20 px from the physical edge preserves every rounded corner.
var RING_LEFT = 24
var RING_TOP = 24
var RING_RIGHT = 366
var RING_BOTTOM = 426
var RING_RADIUS = 42
var RING_THICKNESS = 8
var RING_CORNER_SIZE = 92
var COLON_PERIOD = 2000
var INFO_FADE_DURATION = 4000
var DISPLAY_RESUME_GAP = 250
var INFO_TEXT_SIZE = 36

var stepSensor = null
var timeSensor = null
var batterySensor = null
var refreshTimer = null
var colonWidget = null
var colonSource = ''
var progressSegments = []
var lastProgressKey = -1
var dateWidget = null
var stepsWidget = null
var lowBatteryWidget = null
var lastStepsText = ''
var infoFadeStartedAt = 0
var lastInfoColor = ''
var lastTickAt = 0

function removeProgressSegments() {
  for (var i = 0; i < progressSegments.length; i += 1) {
    hmUI.deleteWidget(progressSegments[i])
  }
  progressSegments = []
}

function addProgressRect(x, y, w, h) {
  progressSegments.push(hmUI.createWidget(hmUI.widget.FILL_RECT, {
    x: x,
    y: y,
    w: w,
    h: h,
    color: PROGRESS_COMPLETE,
    show_level: hmUI.show_level.ONLY_NORMAL,
  }))
}

function addProgressCorner(corner, fraction, x, y) {
  var step = Math.ceil(fraction * 16)
  if (step < 1) return
  if (step > 16) step = 16

  progressSegments.push(hmUI.createWidget(hmUI.widget.IMG, {
    x: x,
    y: y,
    w: RING_CORNER_SIZE,
    h: RING_CORNER_SIZE,
    src: 'images/ring-v2/corner-' + corner + '-' + step + '.png',
    show_level: hmUI.show_level.ONLY_NORMAL,
  }))
}

function updateStepProgress() {
  if (!stepSensor) return

  var steps = Number(stepSensor.current) || 0
  var goal = Number(stepSensor.target) || DEFAULT_STEP_GOAL
  var ratio = Math.max(0, Math.min(1, steps / goal))
  var progressKey = Math.round(ratio * 1000)
  if (progressKey === lastProgressKey) return
  lastProgressKey = progressKey

  removeProgressSegments()

  var horizontal = RING_RIGHT - RING_LEFT - RING_RADIUS * 2
  var vertical = RING_BOTTOM - RING_TOP - RING_RADIUS * 2
  var cornerLength = Math.PI * RING_RADIUS / 2
  var remaining = (horizontal * 2 + vertical * 2 + cornerLength * 4) * ratio
  var topX = RING_LEFT + RING_RADIUS
  var rightY = RING_TOP + RING_RADIUS
  var bottomX = RING_RIGHT - RING_RADIUS
  var leftY = RING_BOTTOM - RING_RADIUS
  var topLeftCornerX = RING_LEFT + RING_RADIUS - RING_CORNER_SIZE / 2
  var topCornerY = RING_TOP + RING_RADIUS - RING_CORNER_SIZE / 2
  var rightCornerX = RING_RIGHT - RING_RADIUS - RING_CORNER_SIZE / 2
  var bottomCornerY = RING_BOTTOM - RING_RADIUS - RING_CORNER_SIZE / 2

  function take(length) {
    var covered = Math.max(0, Math.min(length, remaining))
    remaining -= length
    return covered
  }

  var covered = take(horizontal)
  if (covered) addProgressRect(topX, RING_TOP - RING_THICKNESS / 2, covered, RING_THICKNESS)

  covered = take(cornerLength)
  if (covered) addProgressCorner('tr', covered / cornerLength, rightCornerX, topCornerY)

  covered = take(vertical)
  if (covered) addProgressRect(RING_RIGHT - RING_THICKNESS / 2, rightY, RING_THICKNESS, covered)

  covered = take(cornerLength)
  if (covered) addProgressCorner('br', covered / cornerLength, rightCornerX, bottomCornerY)

  covered = take(horizontal)
  if (covered) addProgressRect(bottomX - covered, RING_BOTTOM - RING_THICKNESS / 2, covered, RING_THICKNESS)

  covered = take(cornerLength)
  if (covered) addProgressCorner('bl', covered / cornerLength, topLeftCornerX, bottomCornerY)

  covered = take(vertical)
  if (covered) addProgressRect(RING_LEFT - RING_THICKNESS / 2, leftY - covered, RING_THICKNESS, covered)

  covered = take(cornerLength)
  if (covered) addProgressCorner('tl', covered / cornerLength, topLeftCornerX, topCornerY)
}

function getDateText() {
  var months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  var day = timeSensor ? Number(timeSensor.day) : 0
  var month = timeSensor ? Number(timeSensor.month) : 0

  if (day > 0 && month > 0 && month <= 12) return day + ' ' + months[month - 1]

  var now = new Date()
  return now.getDate() + ' ' + months[now.getMonth()]
}

function getStepsText() {
  var steps = stepSensor ? Number(stepSensor.current) || 0 : 0
  return steps + ' steps'
}

function updateLowBatteryIndicator() {
  if (!lowBatteryWidget || !batterySensor) return

  var level = Number(batterySensor.current)
  var isLow = level === level && level >= 0 && level <= LOW_BATTERY_PERCENT
  lowBatteryWidget.setProperty(hmUI.prop.VISIBLE, isLow)
}

function ensureInformationWidgets() {
  if (!dateWidget) {
    dateWidget = hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: 67,
      w: SCREEN_W,
      h: 48,
      color: BLACK,
      text_size: INFO_TEXT_SIZE,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text: getDateText(),
      show_level: hmUI.show_level.ONLY_NORMAL,
    })
  }

  var stepsText = getStepsText()
  if (!stepsWidget) {
    stepsWidget = hmUI.createWidget(hmUI.widget.TEXT, {
      x: 0,
      y: 321,
      w: SCREEN_W,
      h: 48,
      color: BLACK,
      text_size: INFO_TEXT_SIZE,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
      text: stepsText,
      show_level: hmUI.show_level.ONLY_NORMAL,
    })
    lastStepsText = stepsText
  } else if (stepsText !== lastStepsText) {
    stepsWidget.setProperty(hmUI.prop.TEXT, stepsText)
    lastStepsText = stepsText
  }

  if (!lowBatteryWidget) {
    lowBatteryWidget = hmUI.createWidget(hmUI.widget.IMG, {
      x: 178,
      y: 374,
      w: 34,
      h: 18,
      src: 'images/battery-low.png',
      show_level: hmUI.show_level.ONLY_NORMAL,
    })
    lowBatteryWidget.setProperty(hmUI.prop.VISIBLE, false)
  }

  updateLowBatteryIndicator()
}

function infoColor(progress) {
  var channel = Math.round(128 * progress)
  var hex = channel.toString(16)
  if (hex.length < 2) hex = '0' + hex
  return '0xFF' + hex + hex + hex
}

function resetInformationFade() {
  infoFadeStartedAt = Date.now()
  lastInfoColor = ''

  if (dateWidget) {
    dateWidget.setProperty(hmUI.prop.TEXT, getDateText())
    dateWidget.setProperty(hmUI.prop.MORE, { color: BLACK })
  }
  if (stepsWidget) stepsWidget.setProperty(hmUI.prop.MORE, { color: BLACK })
}

function updateInformationFade() {
  ensureInformationWidgets()

  var elapsed = Date.now() - infoFadeStartedAt
  var progress = Math.max(0, Math.min(1, elapsed / INFO_FADE_DURATION))
  var color = infoColor(progress)
  if (color === lastInfoColor) return

  dateWidget.setProperty(hmUI.prop.MORE, { color: color })
  stepsWidget.setProperty(hmUI.prop.MORE, { color: color })
  lastInfoColor = color
}

function updateColon() {
  var phase = Date.now() % COLON_PERIOD
  var brightness
  var fadeOut = ['100', '95', '90', '85', '80', '75', '70', '65', '60', '55', '50', '45', '40', '35', '30', '25', '20', '15', '10', '5']
  var fadeIn = ['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80', '85', '90', '95']

  // 1,000 ms fade-out and 1,000 ms fade-in, updated every 50 ms.
  if (phase < 1000) brightness = fadeOut[Math.floor(phase / 50)]
  else brightness = fadeIn[Math.floor((phase - 1000) / 50)]

  var source = 'images/digits-v4/colon-' + brightness + '.png'
  if (source === colonSource) return

  if (colonWidget) hmUI.deleteWidget(colonWidget)
  colonWidget = hmUI.createWidget(hmUI.widget.IMG, {
    x: 183,
    y: 142,
    w: 24,
    h: 165,
    src: source,
    show_level: hmUI.show_level.ONLY_NORMAL,
  })
  colonSource = source
}

function createStepTrack() {
  var horizontal = RING_RIGHT - RING_LEFT - RING_RADIUS * 2
  var vertical = RING_BOTTOM - RING_TOP - RING_RADIUS * 2
  var topX = RING_LEFT + RING_RADIUS
  var rightY = RING_TOP + RING_RADIUS
  var bottomX = RING_RIGHT - RING_RADIUS
  var leftY = RING_BOTTOM - RING_RADIUS
  var topLeftCornerX = RING_LEFT + RING_RADIUS - RING_CORNER_SIZE / 2
  var topCornerY = RING_TOP + RING_RADIUS - RING_CORNER_SIZE / 2
  var rightCornerX = RING_RIGHT - RING_RADIUS - RING_CORNER_SIZE / 2
  var bottomCornerY = RING_BOTTOM - RING_RADIUS - RING_CORNER_SIZE / 2

  function trackRect(x, y, w, h) {
    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: x,
      y: y,
      w: w,
      h: h,
      color: PROGRESS_TRACK,
      show_level: hmUI.show_level.ONLY_NORMAL,
    })
  }

  function trackCorner(corner, x, y) {
    hmUI.createWidget(hmUI.widget.IMG, {
      x: x,
      y: y,
      w: RING_CORNER_SIZE,
      h: RING_CORNER_SIZE,
      src: 'images/ring-v2/corner-track-' + corner + '.png',
      show_level: hmUI.show_level.ONLY_NORMAL,
    })
  }

  trackRect(topX, RING_TOP - RING_THICKNESS / 2, horizontal, RING_THICKNESS)
  trackRect(RING_RIGHT - RING_THICKNESS / 2, rightY, RING_THICKNESS, vertical)
  trackRect(bottomX - horizontal, RING_BOTTOM - RING_THICKNESS / 2, horizontal, RING_THICKNESS)
  trackRect(RING_LEFT - RING_THICKNESS / 2, leftY - vertical, RING_THICKNESS, vertical)
  trackCorner('tr', rightCornerX, topCornerY)
  trackCorner('br', rightCornerX, bottomCornerY)
  trackCorner('bl', topLeftCornerX, bottomCornerY)
  trackCorner('tl', topLeftCornerX, topCornerY)
}

WatchFace({
  build: function () {
    progressSegments = []
    lastProgressKey = -1
    dateWidget = null
    stepsWidget = null
    lowBatteryWidget = null
    lastStepsText = ''
    infoFadeStartedAt = Date.now()
    lastInfoColor = ''
    lastTickAt = Date.now()

    hmUI.createWidget(hmUI.widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: SCREEN_W,
      h: SCREEN_H,
      color: BLACK,
      show_level: hmUI.show_level.ONLY_NORMAL,
    })

    createStepTrack()

    var digits = [
      'images/digits-v4/0.png', 'images/digits-v4/1.png',
      'images/digits-v4/2.png', 'images/digits-v4/3.png',
      'images/digits-v4/4.png', 'images/digits-v4/5.png',
      'images/digits-v4/6.png', 'images/digits-v4/7.png',
      'images/digits-v4/8.png', 'images/digits-v4/9.png',
    ]

    hmUI.createWidget(hmUI.widget.IMG_TIME, {
      hour_zero: 1,
      hour_startX: 56,
      hour_startY: 142,
      hour_array: digits,
      hour_space: 8,
      hour_unit_sc: 'images/digits-v4/colon-0.png',
      hour_unit_tc: 'images/digits-v4/colon-0.png',
      hour_unit_en: 'images/digits-v4/colon-0.png',
      hour_align: hmUI.align.LEFT,
      minute_zero: 1,
      minute_startX: 223,
      minute_startY: 142,
      minute_array: digits,
      minute_space: 8,
      minute_align: hmUI.align.LEFT,
      show_level: hmUI.show_level.ONLY_NORMAL,
    })

    try {
      stepSensor = hmSensor.createSensor(hmSensor.id.STEP)
    } catch (stepError) {}
    try {
      timeSensor = hmSensor.createSensor(hmSensor.id.TIME)
    } catch (timeError) {}
    try {
      batterySensor = hmSensor.createSensor(hmSensor.id.BATTERY)
      batterySensor.addEventListener(hmSensor.event.CHANGE, updateLowBatteryIndicator)
    } catch (batteryError) {}

    updateStepProgress()
    updateColon()
    ensureInformationWidgets()
    resetInformationFade()
    try {
      hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
        resume_call: function () {
          resetInformationFade()
          lastTickAt = Date.now()
        },
        pause_call: function () {
          resetInformationFade()
          lastTickAt = 0
        },
      })
    } catch (delegateError) {}
    try {
      refreshTimer = timer.createTimer(50, 50, function () {
        var now = Date.now()
        if (lastTickAt && now - lastTickAt > DISPLAY_RESUME_GAP) resetInformationFade()
        lastTickAt = now
        updateStepProgress()
        updateColon()
        updateInformationFade()
        updateLowBatteryIndicator()
      }, {})
    } catch (timerError) {}
  },

  onDestroy: function () {
    if (refreshTimer) timer.stopTimer(refreshTimer)
  },
})
