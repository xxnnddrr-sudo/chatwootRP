Rails.application.config.after_initialize do
  begin
    Account.find_each do |account|
      unless account.feature_enabled?('custom_roles')
        account.enable_features('custom_roles')
        account.save!
        Rails.logger.info "Enabled custom_roles for account #{account.id}"
      end
    end
  rescue => e
    Rails.logger.warn "Could not enable custom_roles: #{e.message}"
  end
end