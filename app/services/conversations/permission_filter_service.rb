class Conversations::PermissionFilterService
  attr_reader :conversations, :user, :account

  def initialize(conversations, user, account, plan_hint_selective_filter: false)
    @conversations = conversations
    @user = user
    @account = account
    @plan_hint_selective_filter = plan_hint_selective_filter
  end

  def perform
    return conversations if user_role == 'administrator'

    accessible_conversations
  end

  private

  def accessible_conversations
    # Agents only see:
    # 1. Conversations assigned to them
    # 2. Unassigned conversations in their inboxes
    # 3. Conversations where they are a participant

    assigned_to_me = conversations.where(assignee_id: user.id)

    unassigned_in_my_inboxes = conversations
      .where(assignee_id: nil)
      .where(inbox_id: user.inboxes.where(account_id: account.id).select(:id))

    participating = conversations
      .joins(:conversation_participants)
      .where(conversation_participants: { user_id: user.id })

    assigned_to_me.or(unassigned_in_my_inboxes).or(participating).distinct
  end

  def account_user
    AccountUser.find_by(account_id: account.id, user_id: user.id)
  end

  def user_role
    account_user&.role
  end
end

Conversations::PermissionFilterService.prepend_mod_with('Conversations::PermissionFilterService')