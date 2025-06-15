
export class UsageManager {
  constructor(supabase) {
    this.supabase = supabase;
    this.freeUsageCount = 0;
  }

  async loadUserUsage(userId) {
    try {
      const { data: usage, error } = await this.supabase
        .from('free_usage_tracking')
        .select('usage_count')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading usage:', error);
      }
      
      this.freeUsageCount = usage?.usage_count || 0;
      return this.freeUsageCount;
      
    } catch (error) {
      console.error('Error loading user data:', error);
      return 0;
    }
  }

  async updateFreeUsageCount(userId, subscribed) {
    if (subscribed) return true;
    
    try {
      const newCount = this.freeUsageCount + 1;
      
      const { error } = await this.supabase
        .from('free_usage_tracking')
        .upsert({
          user_id: userId,
          usage_count: newCount,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (error) {
        console.error('Error updating usage:', error);
        return false;
      }
      
      this.freeUsageCount = newCount;
      return true;
      
    } catch (error) {
      console.error('Error updating usage:', error);
      return false;
    }
  }

  updateUsageDisplay(userEmail, subscribed) {
    const dailyCountEl = document.getElementById('daily-count');
    const remainingCountEl = document.getElementById('remaining-count');
    const userEmailEl = document.getElementById('user-email');
    const upgradeNotice = document.getElementById('upgrade-notice');
    const analyzeBtn = document.getElementById('analyze-btn');
    
    if (dailyCountEl) dailyCountEl.textContent = this.freeUsageCount;
    if (remainingCountEl) remainingCountEl.textContent = subscribed ? '∞' : Math.max(0, 3 - this.freeUsageCount);
    if (userEmailEl && userEmail) userEmailEl.textContent = userEmail;
    
    // Show upgrade notice if free limit reached
    if (!subscribed && this.freeUsageCount >= 3) {
      if (upgradeNotice) upgradeNotice.classList.remove('hidden');
      if (analyzeBtn) analyzeBtn.disabled = true;
    } else {
      if (upgradeNotice) upgradeNotice.classList.add('hidden');
      if (analyzeBtn) analyzeBtn.disabled = false;
    }
  }

  canAnalyze(subscribed) {
    return subscribed || this.freeUsageCount < 3;
  }
}
