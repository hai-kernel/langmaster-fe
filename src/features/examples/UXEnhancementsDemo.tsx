/**
 * UX Enhancements Demo Page
 * 
 * This page demonstrates all the new UX enhancement features from Sprint 3:
 * - Loading States
 * - Empty States
 * - Error States
 * - Animations
 * - Keyboard Shortcuts
 * - Tutorial Tooltips
 * - Accessibility
 */

import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

// Loading States
import {
  PageLoading,
  SectionLoading,
  DashboardSkeleton,
  SessionCardSkeleton,
  TableSkeleton,
  ListSkeleton,
  InlineLoading
} from '@/shared/ui/LoadingStates';

// Empty States
import {
  EmptyState,
  NoSessionsEmpty,
  NoLessonsEmpty,
  SearchEmpty,
  NoDataEmpty
} from '@/shared/ui/EmptyStates';

// Error States
import {
  ErrorState,
  NetworkError,
  ServerError,
  InlineError,
  showErrorToast,
  showSuccessToast
} from '@/shared/ui/ErrorStates';

// Animations
import {
  FadeIn,
  SlideUp,
  SlideInLeft,
  SlideInRight,
  ScaleIn,
  BounceIn,
  StaggerChildren,
  StaggerItem,
  HoverScale,
  Shake,
  Pulse,
  FlipCard,
  SuccessCheckmark,
  LoadingDots
} from '@/shared/ui/AnimationWrappers';

// Tutorial
import { TutorialTooltip, FeatureHighlight, InlineTip } from '@/shared/ui/TutorialTooltips';

// Keyboard Shortcuts
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsHelp } from '@/shared/ui/KeyboardShortcutsHelp';

// PWA
import { InstallPWABanner } from '@/shared/ui/InstallPWABanner';

import { 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Sparkles,
  Keyboard
} from 'lucide-react';

export function UXEnhancementsDemo() {
  const [activeTab, setActiveTab] = useState('loading');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showFeature, setShowFeature] = useState(true);
  const [shakeError, setShakeError] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Keyboard shortcut demo
  useKeyboardShortcut('d', () => {
    showSuccessToast('Demo shortcut triggered! (Press D)');
  });

  const tutorialSteps = [
    {
      target: '#demo-tabs',
      title: 'Navigation Tabs',
      content: 'Explore different UX enhancement examples using these tabs',
      placement: 'bottom' as const,
      highlight: true
    },
    {
      target: '#loading-demo',
      title: 'Loading States',
      content: 'See various loading and skeleton components in action',
      placement: 'right' as const
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <SlideUp>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">UX Enhancements Demo</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore all the new user experience features from Sprint 3
          </p>
        </div>
      </SlideUp>

      {/* Feature Highlight */}
      <FeatureHighlight
        title="✨ New Features Available!"
        description="Try pressing 'D' to test keyboard shortcuts, or click through the tabs to explore all enhancements."
        show={showFeature}
        onDismiss={() => setShowFeature(false)}
      />

      {/* Main Demo Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} id="demo-tabs">
        <TabsList className="mb-6">
          <TabsTrigger value="loading">Loading</TabsTrigger>
          <TabsTrigger value="empty">Empty States</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="animations">Animations</TabsTrigger>
          <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
          <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
        </TabsList>

        {/* Loading States Tab */}
        <TabsContent value="loading" id="loading-demo">
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Loading Components</h2>
              <div className="space-y-4">
                <Button
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => setIsLoading(false), 3000);
                  }}
                >
                  Toggle Loading States
                </Button>

                {isLoading && (
                  <FadeIn>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Inline Loading</h3>
                        <InlineLoading size="md" />
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Section Loading</h3>
                        <SectionLoading message="Loading content..." />
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Dashboard Skeleton</h3>
                        <DashboardSkeleton />
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Session Cards Skeleton</h3>
                        <div className="space-y-3">
                          <SessionCardSkeleton />
                          <SessionCardSkeleton />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">Table Skeleton</h3>
                        <TableSkeleton rows={3} cols={4} />
                      </div>

                      <div>
                        <h3 className="text-sm font-medium mb-2">List Skeleton</h3>
                        <ListSkeleton items={3} />
                      </div>
                    </div>
                  </FadeIn>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Loading Dots Animation</h2>
              <LoadingDots />
            </Card>
          </div>
        </TabsContent>

        {/* Empty States Tab */}
        <TabsContent value="empty">
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Empty State Components</h2>
              <Button onClick={() => setShowEmpty(!showEmpty)} className="mb-4">
                Toggle Empty States
              </Button>

              {showEmpty && (
                <div className="space-y-8">
                  <NoSessionsEmpty onCreateSession={() => showSuccessToast('Create session clicked!')} />
                  <NoLessonsEmpty />
                  <SearchEmpty searchQuery="example query" />
                  <NoDataEmpty />
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Error States Tab */}
        <TabsContent value="errors">
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Error Components</h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={() => showErrorToast('This is an error message!')}>
                    Show Error Toast
                  </Button>
                  <Button onClick={() => showSuccessToast('Success! Operation completed.')}>
                    Show Success Toast
                  </Button>
                  <Button onClick={() => setShakeError(!shakeError)}>
                    Trigger Shake
                  </Button>
                </div>

                <Shake trigger={shakeError}>
                  <InlineError
                    title="Validation Error"
                    message="Please check your input and try again."
                    onRetry={() => showSuccessToast('Retrying...')}
                  />
                </Shake>

                <Button onClick={() => setShowError(!showError)}>
                  Toggle Full Error States
                </Button>

                {showError && (
                  <div className="space-y-8">
                    <NetworkError onRetry={() => showSuccessToast('Retrying connection...')} />
                    <ServerError />
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Animations Tab */}
        <TabsContent value="animations">
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Animation Examples</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Fade In</h3>
                  <FadeIn>
                    <Card className="p-4 bg-green-50 dark:bg-green-900/20">
                      Fade in animation
                    </Card>
                  </FadeIn>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Slide Up</h3>
                  <SlideUp>
                    <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
                      Slide up animation
                    </Card>
                  </SlideUp>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Slide In Left</h3>
                  <SlideInLeft>
                    <Card className="p-4 bg-purple-50 dark:bg-purple-900/20">
                      Slide from left
                    </Card>
                  </SlideInLeft>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Slide In Right</h3>
                  <SlideInRight>
                    <Card className="p-4 bg-orange-50 dark:bg-orange-900/20">
                      Slide from right
                    </Card>
                  </SlideInRight>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Scale In</h3>
                  <ScaleIn>
                    <Card className="p-4 bg-pink-50 dark:bg-pink-900/20">
                      Scale animation
                    </Card>
                  </ScaleIn>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Bounce In</h3>
                  <BounceIn>
                    <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20">
                      Bounce animation
                    </Card>
                  </BounceIn>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Hover Scale</h3>
                <HoverScale>
                  <Card className="p-4 bg-gradient-to-r from-green-400 to-green-600 text-white cursor-pointer">
                    Hover over me!
                  </Card>
                </HoverScale>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Pulse Animation</h3>
                <Pulse>
                  <div className="inline-block">
                    <Sparkles className="size-8 text-green-500" />
                  </div>
                </Pulse>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Stagger Children</h3>
                <StaggerChildren>
                  {[1, 2, 3, 4].map((i) => (
                    <StaggerItem key={i}>
                      <Card className="p-4 mb-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                        Item {i} - Staggered animation
                      </Card>
                    </StaggerItem>
                  ))}
                </StaggerChildren>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Success Checkmark</h3>
                <SuccessCheckmark className="size-16" />
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Flip Card (Click to flip)</h3>
                <div onClick={() => setIsCardFlipped(!isCardFlipped)} className="cursor-pointer">
                  <FlipCard
                    isFlipped={isCardFlipped}
                    front={
                      <Card className="p-8 bg-green-500 text-white text-center h-32 flex items-center justify-center">
                        <div className="text-xl font-bold">Front Side</div>
                      </Card>
                    }
                    back={
                      <Card className="p-8 bg-purple-500 text-white text-center h-32 flex items-center justify-center">
                        <div className="text-xl font-bold">Back Side</div>
                      </Card>
                    }
                  />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Keyboard Shortcuts Tab */}
        <TabsContent value="shortcuts">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Keyboard className="size-6 text-green-500" />
                <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
              </div>
              
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm">
                  <strong>Demo shortcut:</strong> Press <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded border">D</kbd> to trigger a demo action!
                </p>
              </div>

              <KeyboardShortcutsHelp role="student" />
            </Card>
          </div>
        </TabsContent>

        {/* Tutorial Tab */}
        <TabsContent value="tutorial">
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Tutorial Tooltips</h2>
              <Button onClick={() => setShowTutorial(true)}>
                Start Tutorial
              </Button>

              {showTutorial && (
                <TutorialTooltip
                  steps={tutorialSteps}
                  onComplete={() => {
                    setShowTutorial(false);
                    showSuccessToast('Tutorial completed!');
                  }}
                  onSkip={() => {
                    setShowTutorial(false);
                    showSuccessToast('Tutorial skipped');
                  }}
                  storageKey="demo-tutorial"
                />
              )}

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Inline Tip Example</h3>
                <InlineTip tip="This is a helpful tooltip that appears on hover">
                  <span className="text-green-600 cursor-help underline decoration-dotted">
                    Hover over me for a tip!
                  </span>
                </InlineTip>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* PWA Install Banner (shows after 30 seconds) */}
      <InstallPWABanner />
    </div>
  );
}