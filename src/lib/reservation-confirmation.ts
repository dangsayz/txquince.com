export function reservationConfirmation({
  paid,
  checkoutFound,
  eventDate,
  depositLabel,
}: {
  paid: boolean;
  checkoutFound: boolean;
  eventDate: string | null;
  depositLabel: string | null;
}) {
  if (paid) {
    return {
      eyebrow: "Reserved",
      title: eventDate ? `Your date is reserved. ${eventDate}.` : "Your date is reserved.",
      message: `${depositLabel ? `Your ${depositLabel} deposit is in` : "Your deposit is in"} and applied to your final balance. We won't accept another celebration on your day. Watch your inbox for a confirmation and next steps.`,
    };
  }

  if (checkoutFound) {
    return {
      eyebrow: "Almost there",
      title: "Thank you. We're confirming your deposit.",
      message: "Your payment is processing. Your date is reserved when it clears, and we will email your confirmation. There is no need to pay again.",
    };
  }

  return {
    eyebrow: "Reservation status",
    title: "We couldn't verify your checkout yet.",
    message: "If you completed a payment, please check your email for a confirmation. Your date is only reserved after the deposit clears. Contact us if you need help checking its status.",
  };
}
