import React, {useEffect, useState, useRef} from 'react'
import {Box, Flex, Text, Checkbox, useColorModeValue, Button, } from '@chakra-ui/react'
import { useDispatch, useSelector } from 'react-redux'

import { updateGoal , updateStatus} from '../actions'
import { patchHabit } from '../apis/apiClient'

const IndividualHabit = (props) => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const checkbox = useRef(null)
  const primaryBgColor = useColorModeValue('gray.200', 'gray.700')
  const [isEnabled, setIsEnabled] = useState(false)
  const [isChecked, setIsChecked] = useState(false)

  useEffect(() => {
    const realised = isMoreThan24Hours(props.goalCompletedAt)

    setIsEnabled(realised)
    setIsChecked(!realised)
    
  }, [])

  useEffect(() => {
    const checker = setInterval(() => {
      handleCheckboxState(props.goalCompletedAt)
    }, 10000)

    return () => clearInterval(checker)
  }, [props.goalCompletedAt, checkbox])

  const handleCheckboxState = (goalCompletedAt) => {
    const isReset = isMoreThan24Hours(goalCompletedAt)
    // check if current date is greater than last check date plus (interval)
    if (isReset && checkbox.current != null) {
      setIsChecked(false)
      checkbox.current.disabled = false
    } 
    // If the day has no reset, this will keep the checkbox from being focusable
    setIsEnabled(isReset)
  }

  const handleCheckBoxClick = (e) => {
    const newDayCount = props.daysCompleted + 1

    // base update for clicking the checkbox
    let changes = { id: props.id, daysCompleted: newDayCount }

    setIsChecked(true)
    //if goal is completed add status property
    if (newDayCount > 27) {
      changes.status= 'completed'
    }

    e.target.disabled = true
    // compareDates(1651371062000)  // TODO compare with a real date later for column sorting
    // update the current time at which it's clicked
    if (e.target.checked) {
      changes.goalCompletedAt = Math.floor(new Date().getTime() / 1000)
    }

    //updating all the changes 
    patchHabit(changes, user.token).then(() => {
      dispatch(updateGoal(changes))
    })
}

  // TODO see line 38; for column sorting
  const compareDates = (oldTimestamp) => {
    // const oneDay = 86400 // 1 day in timestamp format
    const newTimestamp = Date.now()
    const timePlus36hrs = oldTimestamp + 60 * 60 * (24 * 2.5) * 1000 // add 2.5 days to the timestamp from db

    if (timePlus36hrs < newTimestamp) {
      // if user hasn't checked the habit within 36 hours
      console.log('compareDates if WIP')
    } else if (timePlus24hrs >= newTimestamp) {
      // if user has checked the habit within 36 hours
      console.log('compareDates else WIP')
    }
  }

  function isMoreThan24Hours(dateTimeStamp) {
    // exit on initial render
    // TODO seeds hardcode data may be to times that don't exist yet
    if (typeof dateTimeStamp == 'undefined') {
      return false
    }
    
    // getting current date & time as unix timestamp
    // converting it back to a date object for easier 
    const current_date_unix = Math.floor(new Date().getTime() / 1000)
    const current_date_object = new Date(current_date_unix * 1000)

    // adds seconds to the completed date
    // convert it to date object for easier comparisons
    const completed_unix_with_seconds = dateTimeStamp + 20
    const completed_date_object = new Date(completed_unix_with_seconds * 1000)

    return current_date_object > completed_date_object
  }

  //* render

  return (
    <Flex
      alignItems="center"
      mt="4"
      mb="4"
      bg={primaryBgColor}
      borderRadius="2"
    >
      <Box
        height="var(--chakra-sizes-10)"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        width="100%"
        p="3"
        fontSize="16"
      >
        {/* showing checkbox for the habit only if it is in progress */}
        {props.status == 'progress' && (
          <Checkbox
            pr="3"
            colorScheme="green"
            border="gray"
            ref={checkbox}
            isChecked={isChecked}
            // defaultUnchecked='true'
            onChange={isEnabled && handleCheckBoxClick}
            isFocusable={isEnabled}
          />
        )}
        {/* replace the {dayCount} with the useSelector called from the top */}
        <Text pl="3">{props.goal}</Text>
      </Box>
      <Text p="3" whiteSpace="nowrap">
        {props.daysCompleted}/28 Days
      </Text>
    </Flex>
  )
}

export default IndividualHabit