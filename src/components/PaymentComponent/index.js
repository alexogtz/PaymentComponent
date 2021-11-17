import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Modal, Pressable, TextInput, Alert, Dimensions  } from 'react-native'
import { StripeProvider } from '@stripe/stripe-react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const StripeComponent = ({ amount, customer, paymentURL, applicationFeeAmount }) => {
    const [saveCard, setSaveCard] = useState(false);
    const [cardDetails, setCardDetails] = useState();
    const { confirmPayment, loading } = useConfirmPayment();
    const normalizedAmount = String(amount).replace('.','')
    const fetchPaymentIntentClientSecret = async () => {
      const response = await fetch(`${paymentURL}`,{
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: +normalizedAmount,
          saveCard: saveCard,
          customerId: customer,
          application_fee_amount: applicationFeeAmount
        })

      })
      const { clientSecret, error } = await response.json();
      return { clientSecret, error }
    }

    const handlePayPress = async () => {
      if(!cardDetails?.complete) {
        Alert.alert("Please enter Complete card details")
        return
      }
      const billingDetails = {}
      try {
        const { clientSecret, error } = await fetchPaymentIntentClientSecret()
        if(error) {
          console.log('Unable to process payment')
        } else {
          const { paymentIntent, error} = await confirmPayment( clientSecret, {
            type: 'Card',
            billingDetails: billingDetails
          })
          if(error) {
            alert(`Payment Confirmation Error: ${error.message}`)
          } else if(paymentIntent) {
            alert("payment successful")
            console.log('payment successful', paymentIntent)
          }
        }
      } catch (e) {
        console.log(e)
      }
    }
    return (
        <View>
            <View style={styles.centeredView}>
              <CardField 
                postalCodeEnabled={true}
                placeholder={{
                  number: '4242 4242 4242 4242'
                }}
                cardStyle={styles.card}
                style={styles.cardContainer}
                onCardChange={cardDetails => {
                  setCardDetails(cardDetails)
                }}
              />
              <View style={styles.checkboxContainer}>
                <BouncyCheckbox
                  size={25}
                  fillColor="#4f4da6"
                  unfillColor="#FFFFFF"
                  text="Save Card Information"
                  iconStyle={{ borderColor: "#4f4da6" }}
                  textStyle={{ textDecorationLine : 'none' }}
                  onPress={() => setSaveCard(true)}
                />
              </View>
              <Pressable
                style={[styles.button, styles.buttonClose]}
                onPress={handlePayPress}
                disabled={loading}
              >
                <Text style={styles.textStyle}>Pay Now</Text>
              </Pressable>
            </View>
        </View>
    )
}

const PaymentComponent = (props) => {
	const { color, text, apiKey, amount, customer, paymentURL, applicationFeeAmount } = props
	// ApiKey from stripe
	// const apiKey = 'pk_test_51Jrsw9FCebwI82Hfh4n0yOvHISf3f1wqREIYpAR1MD6LSVh39mF1h10djsCHQWZfK1xglWS5vSPeTeHvKWBOZ9DY00ubk5MTJT'

	return(
		<View style={styles.wrapper}>
			<Text style={{ color }}>{text}</Text>
			<StripeProvider
			publishableKey={apiKey}
			>
				<StripeComponent
					amount={amount}
					customer={customer}
					paymentURL={paymentURL}
					applicationFeeAmount={applicationFeeAmount}
				/>
			</StripeProvider>
		</View>
	)
}

const styles = StyleSheet.create({
	wrapper: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      width: windowWidth,
      marginTop: 22
    },
    button: {
      borderRadius: 3,
      padding: 10,
      elevation: 2,
      width: '80%'
    },
    buttonClose: {
      backgroundColor: "#4f4da6",
    },
    textStyle: {
      color: "white",
      fontWeight: "bold",
      textAlign: "center"
    },
    emailInput: {
      backgroundColor: "#efefefef",
      borderRadius: 8,
      fontSize: 20,
      height: 50,
      padding: 10,
      margin: 10,
      width: '80%'
    },
    card: {
      backgroundColor: "#efefefef",
    },
    cardContainer: {
      height: 50,
      marginVertical: 30,
      width: '80%'
    },
    checkboxContainer: {
      flexDirection: "row",
      marginBottom: 20,
    },
    checkbox: {
      alignSelf: 'flex-start',
    },
    label: {
      margin: 8,
    }
})

export default PaymentComponent
