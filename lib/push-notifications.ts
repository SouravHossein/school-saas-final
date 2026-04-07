import { createClient } from '@/lib/supabase/server'

export async function subscribeToPushNotifications(userId: string, subscription: PushSubscription) {
  const supabase = await createClient()

  const subscriptionData = {
    user_id: userId,
    endpoint: subscription.endpoint,
    p256dh: subscription.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : '',
    auth: subscription.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : '',
  }

  const { error } = await supabase.from('push_subscriptions').insert([subscriptionData]).select()

  if (error) {
    console.error('[v0] Error subscribing to push notifications:', error)
    throw error
  }

  return subscriptionData
}

export async function unsubscribeFromPushNotifications(userId: string, endpoint: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', endpoint)

  if (error) {
    console.error('[v0] Error unsubscribing from push notifications:', error)
    throw error
  }
}

export async function getPushSubscriptions(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('[v0] Error fetching push subscriptions:', error)
    return []
  }

  return data || []
}
