'use client';

import { useEffect, useMemo, useState, Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Edit, Settings, Award, TrendingUp, Calendar, LogOut, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { logout } from '@/features/auth/api/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { http } from '@/lib/http';
import { profileApi } from '@/features/profile/api/profile.api';
import { Textarea } from '@/components/ui/textarea';

export default function ProfilePage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [fitnessProfile, setFitnessProfile] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [activityStats, setActivityStats] = useState<any>(null);
  const [isEditStatsDialogOpen, setIsEditStatsDialogOpen] = useState(false);
  const [isEditBioDialogOpen, setIsEditBioDialogOpen] = useState(false);
  const [isEditFitnessDialogOpen, setIsEditFitnessDialogOpen] = useState(false);
  const [editedStats, setEditedStats] = useState({ weight: '', height: '', age: '' });
  const [editedBio, setEditedBio] = useState('');
  const [editedFitness, setEditedFitness] = useState({ primary_goal: '', experience_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert', workout_frequency: '' });
  const [isSavingStats, setIsSavingStats] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [isSavingFitness, setIsSavingFitness] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const handleLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      await logout();
      // Clear localStorage
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_id');
      // Redirect to login
      router.push('/login');
    } catch (err: any) {
      const errorMessage = err?.message || t('errors.logoutError');
      setErrorDialog({ open: true, message: errorMessage });
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // Try /api/v1/auth/me first, fallback to /api/v1/users/profile
        let p: any = null;
        try {
          p = await http.get<any>('/api/v1/auth/me');
        } catch {
          try {
            p = await http.get<any>('/api/v1/users/profile');
          } catch { }
        }

        if (!mounted) return;

        // Extract user data from different response formats
        const userData = p?.data?.user || p?.data || p?.user || p;


        // Only update if we have valid user data
        if (!userData || (!userData.id && !userData.email)) {
          return;
        }

        // Extract user ID safely - validate it's a string and not empty
        const rawUserId = userData?.id || p?.data?.user?.id || p?.data?.id || p?.user?.id || p?.id;
        const userId = (typeof rawUserId === 'string' && rawUserId.trim() !== '') ? rawUserId : null;

        // Try to get personal info
        let info: any = null;
        try {
          info = await http.get<any>('/api/v1/personal/info');
        } catch (err) {
        }

        if (!mounted) return;

        // Try to get user stats if profile doesn't have them AND we have a valid userId
        if (userData && !userData.stats && userId) {
          try {
            const stats = await http.get<any>(`/api/v1/users/${userId}/stats`);
            if (stats) {
              const statsData = stats?.data || stats;
              userData.stats = statsData;
            }
          } catch {
            // Silently fail - stats endpoint might not exist yet
          }
        }

        if (!mounted) return;

        // Try to get achievements ONLY if we have a valid userId
        let achievementsList: any[] = [];
        if (userId) {
          try {
            const ach = await http.get<any>(`/api/v1/users/${userId}/achievements`);
            achievementsList = Array.isArray(ach?.items) ? ach.items
              : Array.isArray(ach?.data) ? ach.data
                : Array.isArray(ach) ? ach
                  : [];
          } catch {
            // Silently fail - achievements endpoint might not exist yet
          }
        }

        if (!mounted) return;

        setProfile(userData);
        setPersonalInfo(info?.data || info);
        setAchievements(achievementsList);

        const finalInfo = info?.data || info;
        setEditedStats({
          weight: finalInfo?.weight_kg ?? '',
          height: finalInfo?.height_cm ?? '',
          age: finalInfo?.age ?? '',
        });

        // Try to get fitness profile
        try {
          const fitness = await profileApi.getFitnessProfile();
          if (mounted) setFitnessProfile(fitness);
        } catch (err) {
        }

        // Get activity stats
        try {
          const stats = await profileApi.getActivityStats(userId || undefined);
          if (mounted) setActivityStats(stats);
        } catch { }
      } catch (err) {
      }
    })();
    return () => { mounted = false; };
  }, []);

  const name = profile?.fullName || profile?.full_name || profile?.name || profile?.username || (profile ? t('common.loading') : '');
  const email = profile?.email || '';
  const avatar = profile?.avatar || profile?.avatar_url || null;
  const bio = profile?.bio || '';
  const memberSince = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }) : '';
  const workoutCount = activityStats?.totalWorkouts || profile?.stats?.totalWorkouts || 0;
  const postCount = activityStats?.totalPosts || profile?.stats?.totalPosts || 0;
  const followersCount = activityStats?.followers || profile?.stats?.followers || 0;

  const bmi = useMemo(() => {
    const w = Number(personalInfo?.weight_kg ?? editedStats.weight);
    const h = Number(personalInfo?.height_cm ?? editedStats.height);
    if (!w || !h) return '';
    const m = h / 100;
    return (w / (m * m)).toFixed(1);
  }, [personalInfo, editedStats]);

  const handleSaveStats = async () => {
    if (isSavingStats) return;
    try {
      setIsSavingStats(true);
      const weight = editedStats.weight === '' ? 0 : parseFloat(String(editedStats.weight)) || 0;
      const height = editedStats.height === '' ? 0 : parseInt(String(editedStats.height)) || 0;
      const age = editedStats.age === '' ? 0 : parseInt(String(editedStats.age)) || 0;

      const data = {
        weight_kg: weight,
        height_cm: height,
        age: age,
      };

      await profileApi.updatePersonalInfo(data);
      const updatedInfo = await profileApi.getPersonalInfo();
      setPersonalInfo(updatedInfo);
      setIsEditStatsDialogOpen(false);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error?.message || err?.message || t('errors.saveError');
      setErrorDialog({ open: true, message: errorMessage });
    } finally {
      setIsSavingStats(false);
    }
  };

  const handleOpenEditStats = () => {
    setEditedStats({
      weight: personalInfo?.weight_kg ? String(personalInfo.weight_kg) : '',
      height: personalInfo?.height_cm ? String(personalInfo.height_cm) : '',
      age: personalInfo?.age ? String(personalInfo.age) : '',
    });
    setIsEditStatsDialogOpen(true);
  };

  const handleOpenEditBio = () => {
    setEditedBio(bio);
    setIsEditBioDialogOpen(true);
  };

  const handleSaveBio = async () => {
    if (isSavingBio) return;
    try {
      setIsSavingBio(true);
      await profileApi.updateBio(editedBio);
      const updatedProfile = await profileApi.getProfile();
      setProfile(updatedProfile);
      setIsEditBioDialogOpen(false);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error?.message || err?.message || 'Failed to save bio';
      setErrorDialog({ open: true, message: errorMessage });
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleOpenEditFitness = () => {
    setEditedFitness({
      primary_goal: fitnessProfile?.primary_goal || '',
      experience_level: fitnessProfile?.experience_level || 'beginner',
      workout_frequency: fitnessProfile?.workout_frequency ? String(fitnessProfile.workout_frequency) : '',
    });
    setIsEditFitnessDialogOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploadingAvatar) return;
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);
      const updatedProfile = await profileApi.uploadAvatar(formData);
      setProfile(updatedProfile);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error?.message || err?.message || 'Failed to upload avatar';
      setErrorDialog({ open: true, message: errorMessage });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveFitness = async () => {
    if (isSavingFitness) return;
    try {
      setIsSavingFitness(true);
      const data = {
        primary_goal: editedFitness.primary_goal,
        experience_level: editedFitness.experience_level,
        workout_frequency: editedFitness.workout_frequency ? parseInt(editedFitness.workout_frequency) : undefined,
      };
      await profileApi.updateFitnessProfile(data);
      const updatedFitness = await profileApi.getFitnessProfile();
      setFitnessProfile(updatedFitness);
      setIsEditFitnessDialogOpen(false);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error?.message || err?.message || 'Failed to save fitness profile';
      setErrorDialog({ open: true, message: errorMessage });
    } finally {
      setIsSavingFitness(false);
    }
  };


  return (
    <Fragment>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 dark:text-white mb-2">{t('profile.personalProfile')}</h1>
            <p className="text-slate-600 dark:text-slate-400">{t('profile.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/profile/settings">
              <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                <Settings className="h-4 w-4 mr-2" />
                {t('profile.settings.title')}
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? t('auth.loggingOut') : t('auth.logout')}
            </Button>
          </div>
        </div>

        {/* Profile Header */}
        <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 border-slate-200 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatar || undefined} />
                  <AvatarFallback className="bg-emerald-500 text-white text-2xl">
                    {name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-2 cursor-pointer shadow-lg">
                  <Edit className="h-4 w-4" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                  />
                </label>
              </div>
              <div className="flex-1">
                <h2 className="text-slate-900 dark:text-white text-2xl mb-1">{name}</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-2">{email}</p>
                {bio && (
                  <p className="text-slate-600 dark:text-slate-400 mb-4 italic">"{bio}"</p>
                )}
                <div className="flex gap-4 items-center">
                  {memberSince && (
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{t('profile.memberSince')}</p>
                      <p className="text-slate-900 dark:text-white">{memberSince}</p>
                    </div>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleOpenEditBio} className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10">
                    <Edit className="h-4 w-4 mr-1" />
                    {bio ? t('profile.editBio') : t('profile.addBio')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  {t('profile.physicalStats')}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleOpenEditStats} className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10">
                  <Edit className="h-4 w-4 mr-1" />
                  {t('common.edit')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">{t('profile.weight')}</span>
                <span className="text-slate-900 dark:text-white">{personalInfo?.weight_kg ?? '—'} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">{t('profile.height')}</span>
                <span className="text-slate-900 dark:text-white">{personalInfo?.height_cm ?? '—'} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">{t('profile.age')}</span>
                <span className="text-slate-900 dark:text-white">{personalInfo?.age ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">BMI</span>
                <span className="text-slate-900 dark:text-white">{bmi || '—'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                {t('profile.activity')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">{t('profile.postsPublished')}</span>
                <span className="text-slate-900 dark:text-white">{postCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">{t('profile.workoutsCreated')}</span>
                <span className="text-slate-900 dark:text-white">{workoutCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">{t('profile.followers')}</span>
                <span className="text-slate-900 dark:text-white">{followersCount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Level: shown only if data available */}
          {profile?.level && profile?.xp && (
            <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  {t('profile.level')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-900 dark:text-white">{t('profile.level')} {profile.level}</span>
                    <span className="text-slate-600 dark:text-slate-400">{profile.xp?.current} / {profile.xp?.next} XP</span>
                  </div>
                  <Progress value={Number(profile.xp?.percent || 0)} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                {t('profile.achievements')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {achievements.map((a: any) => (
                  <div key={String(a.id || a.name)} className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-yellow-500/20">
                    <div className="text-4xl mb-2">{a.icon || '🏅'}</div>
                    <h3 className="text-slate-900 dark:text-white mb-1">{a.name || 'Achievement'}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{a.description || ''}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fitness Profile Section */}
        <Card className="bg-white/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-purple-500" />
                {t('profile.fitnessProfile')}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleOpenEditFitness} className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10">
                <Edit className="h-4 w-4 mr-1" />
                {fitnessProfile ? t('common.edit') : t('common.setup')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {fitnessProfile ? (
              <>
                {fitnessProfile.primary_goal && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t('profile.primaryGoal')}</span>
                    <span className="text-slate-900 dark:text-white capitalize">{fitnessProfile.primary_goal}</span>
                  </div>
                )}
                {fitnessProfile.experience_level && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t('profile.experienceLevel')}</span>
                    <span className="text-slate-900 dark:text-white capitalize">{t(`workouts.${fitnessProfile.experience_level}` as any) === `workouts.${fitnessProfile.experience_level}` ? fitnessProfile.experience_level : t(`workouts.${fitnessProfile.experience_level}` as any)}</span>
                  </div>
                )}
                {fitnessProfile.workout_frequency && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t('profile.workoutFrequency')}</span>
                    <span className="text-slate-900 dark:text-white">{fitnessProfile.workout_frequency} {t('common.days')}/{t('common.week')}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-600 dark:text-slate-400 text-center py-4">
                {t('profile.setupFitnessProfile')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bio Edit Dialog */}
      <Dialog open={isEditBioDialogOpen} onOpenChange={setIsEditBioDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">{t('profile.editBio')}</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {t('profile.bioDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              placeholder={t('profile.bioPlaceholder')}
              className="min-h-[120px] bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              maxLength={500}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{editedBio.length}/500 {t('common.characters')}</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditBioDialogOpen(false)}
              disabled={isSavingBio}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSaveBio}
              disabled={isSavingBio}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
            >
              {isSavingBio ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fitness Profile Edit Dialog */}
      <Dialog open={isEditFitnessDialogOpen} onOpenChange={setIsEditFitnessDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">{t('profile.updateFitnessProfile')}</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {t('profile.fitnessProfileDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="primary_goal" className="text-slate-900 dark:text-white">{t('profile.primaryGoal')}</Label>
              <Input
                id="primary_goal"
                type="text"
                value={editedFitness.primary_goal}
                onChange={(e) => setEditedFitness({ ...editedFitness, primary_goal: e.target.value })}
                placeholder="e.g., Build muscle, Lose weight, Improve endurance"
                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience_level" className="text-slate-900 dark:text-white">{t('profile.experienceLevel')}</Label>
              <select
                id="experience_level"
                value={editedFitness.experience_level}
                onChange={(e) => setEditedFitness({ ...editedFitness, experience_level: e.target.value as any })}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
              >
                <option value="beginner">{t('workouts.beginner')}</option>
                <option value="intermediate">{t('workouts.intermediate')}</option>
                <option value="advanced">{t('workouts.advanced')}</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workout_frequency" className="text-slate-900 dark:text-white">{t('profile.workoutFrequency')} ({t('common.days')}/{t('common.week')})</Label>
              <Input
                id="workout_frequency"
                type="number"
                min="1"
                max="7"
                value={editedFitness.workout_frequency}
                onChange={(e) => setEditedFitness({ ...editedFitness, workout_frequency: e.target.value })}
                placeholder="e.g., 3"
                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditFitnessDialogOpen(false)}
              disabled={isSavingFitness}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSaveFitness}
              disabled={isSavingFitness}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
            >
              {isSavingFitness ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Stats Dialog */}
      <Dialog open={isEditStatsDialogOpen} onOpenChange={setIsEditStatsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-900 dark:text-white">{t('profile.updatePhysicalStats')}</DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {t('profile.physicalStatsDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-slate-900 dark:text-white">{t('profile.weight')}</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                max="500"
                value={editedStats.weight}
                onChange={(e) => {
                  setEditedStats({ ...editedStats, weight: e.target.value });
                }}
                placeholder="0.0"
                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="text-slate-900 dark:text-white">{t('profile.height')}</Label>
              <Input
                id="height"
                type="number"
                min="1"
                max="300"
                value={editedStats.height}
                onChange={(e) => {
                  setEditedStats({ ...editedStats, height: e.target.value });
                }}
                placeholder="0"
                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age" className="text-slate-900 dark:text-white">{t('profile.age')}</Label>
              <Input
                id="age"
                type="number"
                min="13"
                max="120"
                value={editedStats.age}
                onChange={(e) => {
                  setEditedStats({ ...editedStats, age: e.target.value });
                }}
                placeholder="0"
                className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            {editedStats.weight && editedStats.height && Number(editedStats.weight) > 0 && Number(editedStats.height) > 0 && (
              <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{t('profile.calculatedBMI')}</p>
                <p className="text-2xl text-slate-900 dark:text-white">{(() => {
                  const w = Number(editedStats.weight);
                  const h = Number(editedStats.height) / 100;
                  return (w / (h * h)).toFixed(1);
                })()}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditStatsDialogOpen(false)}
              disabled={isSavingStats}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSaveStats}
              disabled={isSavingStats}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingStats ? t('common.loading') : t('profile.saveStats')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <AlertDialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ open, message: errorDialog.message })}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-white">{t('errors.error')}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {errorDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialog({ open: false, message: '' })} className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {t('common.ok')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  );
}
