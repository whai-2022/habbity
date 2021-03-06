import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Box,
  Heading,
  Text,
  Badge,
  Divider,
  Center,
  Flex,
  Spacer,
  Button,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  getBadge,
  getUserByAuth0Id,
  updateBadgeByUser,
} from '../apis/apiClient'
import { CheckIcon, RepeatIcon } from '@chakra-ui/icons'

const Badges = () => {
  const primaryShadowColor = useColorModeValue(
    '1px 1px 15px 8px white',
    '0px 3px 15px rgba(0,0,0,0.2)'
  )
  const profile = useSelector((state) => state.profile)
  const user = useSelector((state) => state.user)
  const [userInfo, setUserInfo] = useState(null)
  const [badges, setBadges] = useState([])
  const [getBadgeSuccess, setGetBadgeSuccess] = useState(0)
  const [newBadgeToGet, setNewBadgeToGet] = useState(0)
  const [newBadges, setNewBadges] = useState([])
  const [isConfirmed, setIsConfirmed] = useState(false)

  useEffect(() => {
    if (user.token) {
      getUserByAuth0Id(user.token)
        .then((res) => {
          setUserInfo(res)
        })
        .catch((err) => console.log('getUserByAuth0Id', err.message))
    }
    setIsConfirmed(false)
  }, [user, isConfirmed])

  useEffect(() => {
    userInfo !== null && setBadges(userInfo['badges']?.split(','))
  }, [userInfo, isConfirmed])

  useEffect(() => {
    userInfo !== null && calculatePoints(userInfo.points)
  }, [badges, isConfirmed])

  useEffect(() => {
    if (newBadgeToGet > 0) {
      if (getBadgeSuccess < newBadgeToGet) {
        setNewBadges([...newBadges, 'reveal'])
        setGetBadgeSuccess(getBadgeSuccess + 1)
      }
    }
  }, [newBadgeToGet, getBadgeSuccess, isConfirmed])

  const calculatePoints = (num) => {
    const badgeToBeAwarded = Math.round(Math.floor(num / 56))
    const badgeAwarded = badges.length
    setNewBadgeToGet(badgeToBeAwarded - badgeAwarded)
   
  }

  const revealBadge = (e) => {
    e.preventDefault()
    const newBadgesIndex = e.target.id
    getNewGiphy(newBadgesIndex)
  }

  const getNewGiphy = async (newBadgesIndex) => {
    getBadge(user)
      .then((giphyUrl) => {
        setNewBadges(
          newBadges?.map((element, index) =>
            index == newBadgesIndex ? giphyUrl.embed_url : element
          )
        )
      })
      .catch((err) => console.log('getBadge', err.message))
  }

  const shuffleBadge = (e) => {
    e.preventDefault()
    const shuffleIndex = e.target.id
    getNewGiphy(shuffleIndex)
  }

  const confirmBadge = (badge) => {
    const updatedBadges = [...badges, badge]
    const data = {
      auth0Id: user.auth0Id,
      token: user.token,
      badges: updatedBadges.join(','),
    }
    updateUserBadges(data)
  }

  const updateUserBadges = async (data) => {
    updateBadgeByUser(data)
      .then(() => {
        setIsConfirmed(true)
        setNewBadges([])
        setGetBadgeSuccess(0)
      })
      .catch((err) => console.log('updateBadges', err.message))
  }

  const badgeStyle = {
    borderRadius: '5px',
    padding: '5px 10px 5px 10px',
    marginLeft: '20px',
    textAlign: 'center',
  }
  const giphyStyle = {
    width: '300px',
    height: '300px',
    backgroundColor: 'transparent',
    alignItem: 'center',
    justifyContent: 'center',
    display: 'flex',
    margin: '10px',
    boxShadow: primaryShadowColor,
  }

  const iframeStyle = {
    height: '100%',
    width: '100%',
  }

  const iconButtonStyle = {
    display: 'flex',
    flexDirection: 'row',
  }
  
  return (
    <Box w="100%" p={4} color="teal.500">
      <Heading as="h3" size="lg">
        Welcome {user.name}!
        {userInfo !== null ? (
          <Badge ml="1" fontSize="0.5em" colorScheme="teal" style={badgeStyle}>
            {profile.points} xp
          </Badge>
        ) : null}
      </Heading>
      <Center height="50px">
        <Divider orientation="vertical" />
      </Center>
      <Text fontSize="3xl">
        As you progress towards your goals, we celebrate your growth here by
        filling up the page with a new gif. Ever onwards!
      </Text>
      <Center height="50px">
        <Divider orientation="vertical" />
      </Center>
      <Flex style={{ flexWrap: 'wrap' }}>
        {badges &&
          badges.length !== 0 &&
          badges.map((badge, index) => {
            return (
              <Box key={index} data-testid="badge">
                <Box
                  maxW="sm"
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  style={giphyStyle}
                >
                  <iframe src={badge} alt="badge GIF" style={iframeStyle} />
                </Box>
                <Spacer />
              </Box>
            )
          })}
        {newBadges.length !== 0 &&
          newBadges.map((badge, index) => {
            return (
              <Box key={'new' + index} data-testid="badge">
                <Box
                  maxW="sm"
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  style={giphyStyle}
                >
                  {badge === 'reveal' ? (
                    <Center
                      color="teal.400"
                      align="center"
                      style={{ iframeStyle }}
                    >
                      <Button
                        align="center"
                        colorScheme="teal"
                        size="md"
                        onClick={revealBadge}
                        id={index}
                      >
                        Reveal New Badge!
                      </Button>
                    </Center>
                  ) : (
                    <>
                      <iframe src={badge} alt="badge GIF" style={iframeStyle} />
                    </>
                  )}
                </Box>
                {badge !== 'reveal' ? (
                  <Center display="flex" style={iconButtonStyle}>
                    <IconButton
                      m="1"
                      colorScheme="teal"
                      aria-label="Change Gif"
                      icon={<RepeatIcon />}
                      onClick={shuffleBadge}
                      id={index}
                    />
                    <IconButton
                      m="1"
                      colorScheme="teal"
                      aria-label="Change Gif"
                      icon={<CheckIcon />}
                      onClick={() => confirmBadge(badge)}
                      id={index}
                      type="button"
                    />
                  </Center>
                ) : null}
                <Spacer />
              </Box>
            )
          })}
      </Flex>
    </Box>
  )
}

export default Badges
