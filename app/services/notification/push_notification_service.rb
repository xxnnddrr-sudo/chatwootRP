class Notification::PushNotificationService
  include Rails.application.routes.url_helpers

  pattr_initialize [:notification!]

  def perform
    return unless user_subscribed_to_notification?

    notification_subscriptions.each do |subscription|
      send_browser_push(subscription)
      send_fcm_push(subscription)
      send_push_via_chatwoot_hub(subscription)
    end
  end

  private

  delegate :user, to: :notification
  delegate :notification_subscriptions, to: :user
  delegate :notification_settings, to: :user

  def user_subscribed_to_notification?
    notification_setting = notification_settings.find_by(account_id: notification.account.id)
    return true if notification_setting.public_send("push_#{notification.notification_type}?")

    false
  end

  def conversation
    @conversation ||= notification.conversation
  end

  def push_message
    {
      title: notification.push_message_title,
      body: notification.try(:push_message_body).presence || notification.push_message_title,
      tag: "#{notification.notification_type}_#{conversation.display_id}_#{notification.id}",
      url: push_url,
      icon: '/favicon.ico'
    }
  end

  # Avoid "Missing host to link to!" when default_url_options[:host] is unset (common on Render/workers).
  def push_url
    path = "/app/accounts/#{conversation.account_id}/conversations/#{conversation.display_id}"
    base = frontend_base_url
    return "#{base}#{path}" if base.present?

    path
  end

  def frontend_base_url
    raw = ENV['FRONTEND_URL'].presence ||
          ENV['BACKEND_URL'].presence ||
          Rails.application.routes.default_url_options[:host].presence

    return nil if raw.blank?

    base = raw.to_s.strip.sub(%r{/\z}, '')
    base = "https://#{base}" unless base.start_with?('http