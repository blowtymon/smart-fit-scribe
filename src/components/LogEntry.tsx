import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Upload, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Log, NutritionData, BodyMeasurements, RecoveryData, StrengthTraining, Exercise, WorkoutSet } from './FitnessCoach';

interface LogEntryProps {
  onSubmit: (log: Omit<Log, 'id' | 'timestamp'>) => void;
}

const generateFakeData = (): Omit<Log, 'id' | 'timestamp'>[] => {
  const fakeData: Omit<Log, 'id' | 'timestamp'>[] = [];
  
  // Nutrition logs
  fakeData.push({
    type: 'nutrition',
    content: 'Daily nutrition tracking - hitting protein goals',
    structured: {
      nutrition: {
        calories: 2800,
        carbs: 350,
        protein: 180,
        fat: 80
      }
    }
  });

  fakeData.push({
    type: 'nutrition',
    content: 'Post-workout meal timing',
    structured: {
      nutrition: {
        calories: 3200,
        carbs: 400,
        protein: 200,
        fat: 90
      }
    }
  });

  // Body measurements
  fakeData.push({
    type: 'metrics',
    content: 'Weekly body measurements and progress photos',
    structured: {
      bodyMeasurements: {
        weight: 78.5,
        bodyFat: 12.5,
        waist: 82,
        leftBicep: 38,
        rightBicep: 38.5
      }
    }
  });

  fakeData.push({
    type: 'metrics',
    content: 'Morning weigh-in - feeling lean',
    structured: {
      bodyMeasurements: {
        weight: 77.8,
        bodyFat: 11.8,
        waist: 81,
        leftBicep: 38.2,
        rightBicep: 38.8
      }
    }
  });

  // Recovery data
  fakeData.push({
    type: 'recovery',
    content: 'Morning recovery metrics - feeling great',
    structured: {
      recovery: {
        hrv: 45,
        restingHR: 58,
        doms: 2
      }
    }
  });

  fakeData.push({
    type: 'recovery',
    content: 'Post-leg day recovery check',
    structured: {
      recovery: {
        hrv: 38,
        restingHR: 65,
        doms: 6
      }
    }
  });

  // Strength training workouts
  fakeData.push({
    type: 'strength',
    content: 'Push workout - chest and shoulders focus',
    structured: {
      strengthTraining: {
        title: 'Push A - Delts & Chest',
        date: '29/07/2025',
        exercises: [
          {
            name: 'Shoulder Press - Isolateral',
            sets: [
              { reps: 5, weight: 27.5, rir: 0 },
              { reps: 8, weight: 25, rir: 0.5 },
              { reps: 8, weight: 25, rir: 1 },
              { reps: 6, weight: 25, rir: 0 }
            ],
            notes: 'RIR: 0,0.5,1,0'
          },
          {
            name: 'Incline Bench Press (Dumbbell)',
            sets: [
              { reps: 10, weight: 24, rir: 2 },
              { reps: 10, weight: 26, rir: 1.5 },
              { reps: 10, weight: 26, rir: 1.5 },
              { reps: 11, weight: 26, rir: 0 }
            ],
            notes: 'RIR: 2,1.5,1.5,0'
          },
          {
            name: 'Cable Crossover',
            sets: [
              { reps: 12, weight: 35, rir: 1 },
              { reps: 12, weight: 35, rir: 1 },
              { reps: 12, weight: 35, rir: 0 }
            ],
            notes: 'RIR: 1,1,0'
          }
        ],
        workoutNotes: 'Working sets per group: Delts - 7, Chest - 10, Tricep - 8'
      }
    }
  });

  fakeData.push({
    type: 'strength',
    content: 'Pull workout - back and biceps',
    structured: {
      strengthTraining: {
        title: 'Pull A - Back & Biceps',
        date: '27/07/2025',
        exercises: [
          {
            name: 'Lat Pulldown',
            sets: [
              { reps: 8, weight: 70, rir: 1 },
              { reps: 10, weight: 65, rir: 1 },
              { reps: 12, weight: 60, rir: 0 }
            ],
            notes: 'RIR: 1,1,0'
          },
          {
            name: 'Barbell Row',
            sets: [
              { reps: 6, weight: 80, rir: 0 },
              { reps: 8, weight: 75, rir: 1 },
              { reps: 10, weight: 70, rir: 0 }
            ],
            notes: 'RIR: 0,1,0'
          }
        ],
        workoutNotes: 'Great session, felt strong on all movements'
      }
    }
  });

  return fakeData;
};

export const LogEntry = ({ onSubmit }: LogEntryProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('quick');
  
  // Quick log state
  const [quickContent, setQuickContent] = useState('');
  const [logType, setLogType] = useState<Log['type']>('workout');
  
  // Nutrition state
  const [nutrition, setNutrition] = useState<NutritionData>({});
  
  // Body measurements state
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurements>({});
  
  // Recovery state
  const [recovery, setRecovery] = useState<RecoveryData>({});
  
  // Strength training state
  const [strengthTraining, setStrengthTraining] = useState<StrengthTraining>({
    title: '',
    date: '',
    exercises: [],
    workoutNotes: ''
  });
  
  // File upload state
  const [files, setFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    // Validate file types and sizes
    const validFiles = selectedFiles.filter(file => {
      const isValidType = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type`,
          variant: "destructive"
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });
    
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleQuickLog = async () => {
    if (!quickContent.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your log",
        variant: "destructive"
      });
      return;
    }

    const attachments = await Promise.all(
      files.map(async (file) => ({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        content: await fileToBase64(file)
      }))
    );

    onSubmit({
      type: logType,
      content: quickContent,
      attachments: attachments.length > 0 ? attachments : undefined
    });

    setQuickContent('');
    setFiles([]);
    toast({
      title: "Log submitted",
      description: "Your log has been recorded successfully"
    });
  };

  const handleStructuredSubmit = async (type: Log['type'], data: any, description: string) => {
    const attachments = await Promise.all(
      files.map(async (file) => ({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        content: await fileToBase64(file)
      }))
    );

    onSubmit({
      type,
      content: description,
      structured: data,
      attachments: attachments.length > 0 ? attachments : undefined
    });

    // Reset forms
    setNutrition({});
    setBodyMeasurements({});
    setRecovery({});
    setStrengthTraining({ title: '', date: '', exercises: [], workoutNotes: '' });
    setFiles([]);
    
    toast({
      title: "Log submitted",
      description: "Your structured log has been recorded successfully"
    });
  };

  const addExercise = () => {
    setStrengthTraining(prev => ({
      ...prev,
      exercises: [...prev.exercises, { name: '', sets: [], notes: '' }]
    }));
  };

  const updateExercise = (index: number, exercise: Exercise) => {
    setStrengthTraining(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => i === index ? exercise : ex)
    }));
  };

  const removeExercise = (index: number) => {
    setStrengthTraining(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const addSet = (exerciseIndex: number) => {
    const exercise = strengthTraining.exercises[exerciseIndex];
    const updatedExercise = {
      ...exercise,
      sets: [...exercise.sets, { reps: 0, weight: 0, rir: 0, notes: '' }]
    };
    updateExercise(exerciseIndex, updatedExercise);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, set: WorkoutSet) => {
    const exercise = strengthTraining.exercises[exerciseIndex];
    const updatedExercise = {
      ...exercise,
      sets: exercise.sets.map((s, i) => i === setIndex ? set : s)
    };
    updateExercise(exerciseIndex, updatedExercise);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const exercise = strengthTraining.exercises[exerciseIndex];
    const updatedExercise = {
      ...exercise,
      sets: exercise.sets.filter((_, i) => i !== setIndex)
    };
    updateExercise(exerciseIndex, updatedExercise);
  };

  const generateFakeDataHandler = () => {
    const fakeData = generateFakeData();
    fakeData.forEach(log => onSubmit(log));
    toast({
      title: "Fake data generated",
      description: `Added ${fakeData.length} sample logs to your history`
    });
  };

  return (
    <div className="space-y-6">
      {/* Generate Fake Data Button */}
      <Card>
        <CardContent className="p-4">
          <Button 
            onClick={generateFakeDataHandler}
            variant="outline"
            className="w-full"
          >
            🎲 Generate Sample Data (for testing)
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-card via-card to-card/90">
        <CardHeader>
          <CardTitle className="text-xl">Add Training Log</CardTitle>
          <p className="text-sm text-muted-foreground">
            Log your training data using structured forms or quick text entry
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="quick">Quick</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
              <TabsTrigger value="recovery">Recovery</TabsTrigger>
              <TabsTrigger value="strength">Strength</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            {/* Quick Log */}
            <TabsContent value="quick" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="logType">Log Type</Label>
                  <Select value={logType} onValueChange={(value: Log['type']) => setLogType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workout">Workout</SelectItem>
                      <SelectItem value="nutrition">Nutrition</SelectItem>
                      <SelectItem value="recovery">Recovery</SelectItem>
                      <SelectItem value="metrics">Metrics</SelectItem>
                      <SelectItem value="strength">Strength Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="e.g., DOMS 3, 71.4kg, 6.5h sleep, sore triceps"
                    value={quickContent}
                    onChange={(e) => setQuickContent(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Natural language parsing enabled - mention DOMS, weight, waist, sleep, etc.
                  </p>
                </div>

                <Button onClick={handleQuickLog} className="w-full">
                  Submit Quick Log
                </Button>
              </div>
            </TabsContent>

            {/* Nutrition */}
            <TabsContent value="nutrition" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="2500"
                    value={nutrition.calories || ''}
                    onChange={(e) => setNutrition(prev => ({ ...prev, calories: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    placeholder="300"
                    value={nutrition.carbs || ''}
                    onChange={(e) => setNutrition(prev => ({ ...prev, carbs: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    placeholder="150"
                    value={nutrition.protein || ''}
                    onChange={(e) => setNutrition(prev => ({ ...prev, protein: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    placeholder="80"
                    value={nutrition.fat || ''}
                    onChange={(e) => setNutrition(prev => ({ ...prev, fat: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
              </div>
              <Button 
                onClick={() => handleStructuredSubmit('nutrition', { nutrition }, 'Daily nutrition tracking')}
                className="w-full"
                disabled={!nutrition.calories && !nutrition.carbs && !nutrition.protein && !nutrition.fat}
              >
                Submit Nutrition Log
              </Button>
            </TabsContent>

            {/* Body Measurements */}
            <TabsContent value="body" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="75.5"
                    value={bodyMeasurements.weight || ''}
                    onChange={(e) => setBodyMeasurements(prev => ({ ...prev, weight: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <Label htmlFor="bodyFat">Body Fat (%)</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    placeholder="12.5"
                    value={bodyMeasurements.bodyFat || ''}
                    onChange={(e) => setBodyMeasurements(prev => ({ ...prev, bodyFat: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <Label htmlFor="waist">Waist (cm)</Label>
                  <Input
                    id="waist"
                    type="number"
                    step="0.1"
                    placeholder="85.0"
                    value={bodyMeasurements.waist || ''}
                    onChange={(e) => setBodyMeasurements(prev => ({ ...prev, waist: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <Label htmlFor="leftBicep">Left Bicep (cm)</Label>
                  <Input
                    id="leftBicep"
                    type="number"
                    step="0.1"
                    placeholder="38.0"
                    value={bodyMeasurements.leftBicep || ''}
                    onChange={(e) => setBodyMeasurements(prev => ({ ...prev, leftBicep: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <Label htmlFor="rightBicep">Right Bicep (cm)</Label>
                  <Input
                    id="rightBicep"
                    type="number"
                    step="0.1"
                    placeholder="38.5"
                    value={bodyMeasurements.rightBicep || ''}
                    onChange={(e) => setBodyMeasurements(prev => ({ ...prev, rightBicep: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
              </div>
              <Button 
                onClick={() => handleStructuredSubmit('metrics', { bodyMeasurements }, 'Body measurements tracking')}
                className="w-full"
                disabled={!bodyMeasurements.weight && !bodyMeasurements.bodyFat && !bodyMeasurements.waist && !bodyMeasurements.leftBicep && !bodyMeasurements.rightBicep}
              >
                Submit Body Measurements
              </Button>
            </TabsContent>

            {/* Recovery */}
            <TabsContent value="recovery" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="hrv">HRV (ms)</Label>
                  <Input
                    id="hrv"
                    type="number"
                    placeholder="45"
                    value={recovery.hrv || ''}
                    onChange={(e) => setRecovery(prev => ({ ...prev, hrv: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <Label htmlFor="restingHR">Resting HR (bpm)</Label>
                  <Input
                    id="restingHR"
                    type="number"
                    placeholder="60"
                    value={recovery.restingHR || ''}
                    onChange={(e) => setRecovery(prev => ({ ...prev, restingHR: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
                <div>
                  <Label htmlFor="doms">DOMS (1-10)</Label>
                  <Input
                    id="doms"
                    type="number"
                    min="1"
                    max="10"
                    placeholder="3"
                    value={recovery.doms || ''}
                    onChange={(e) => setRecovery(prev => ({ ...prev, doms: parseFloat(e.target.value) || undefined }))}
                  />
                </div>
              </div>
              <Button 
                onClick={() => handleStructuredSubmit('recovery', { recovery }, 'Recovery metrics tracking')}
                className="w-full"
                disabled={!recovery.hrv && !recovery.restingHR && !recovery.doms}
              >
                Submit Recovery Data
              </Button>
            </TabsContent>

            {/* Strength Training */}
            <TabsContent value="strength" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workoutTitle">Workout Title</Label>
                    <Input
                      id="workoutTitle"
                      placeholder="Push A - Delts & Chest"
                      value={strengthTraining.title}
                      onChange={(e) => setStrengthTraining(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="workoutDate">Date</Label>
                    <Input
                      id="workoutDate"
                      type="date"
                      value={strengthTraining.date}
                      onChange={(e) => setStrengthTraining(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Exercises */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Exercises</Label>
                    <Button onClick={addExercise} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Exercise
                    </Button>
                  </div>

                  {strengthTraining.exercises.map((exercise, exerciseIndex) => (
                    <Card key={exerciseIndex} className="border-border/50">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Input
                            placeholder="Exercise name"
                            value={exercise.name}
                            onChange={(e) => updateExercise(exerciseIndex, { ...exercise, name: e.target.value })}
                            className="flex-1 mr-2"
                          />
                          <Button
                            onClick={() => removeExercise(exerciseIndex)}
                            size="sm"
                            variant="ghost"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Sets */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Sets</Label>
                            <Button
                              onClick={() => addSet(exerciseIndex)}
                              size="sm"
                              variant="outline"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Set
                            </Button>
                          </div>

                          {exercise.sets.map((set, setIndex) => (
                            <div key={setIndex} className="grid grid-cols-5 gap-2">
                              <Input
                                type="number"
                                placeholder="Reps"
                                value={set.reps || ''}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, { ...set, reps: parseInt(e.target.value) || 0 })}
                              />
                              <Input
                                type="number"
                                step="0.5"
                                placeholder="Weight"
                                value={set.weight || ''}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, { ...set, weight: parseFloat(e.target.value) || 0 })}
                              />
                              <Input
                                type="number"
                                step="0.5"
                                placeholder="RIR"
                                value={set.rir || ''}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, { ...set, rir: parseFloat(e.target.value) || undefined })}
                              />
                              <Input
                                placeholder="Notes"
                                value={set.notes || ''}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, { ...set, notes: e.target.value })}
                              />
                              <Button
                                onClick={() => removeSet(exerciseIndex, setIndex)}
                                size="sm"
                                variant="ghost"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        <div>
                          <Label className="text-sm">Exercise Notes</Label>
                          <Textarea
                            placeholder="RIR: 2,1,0"
                            value={exercise.notes || ''}
                            onChange={(e) => updateExercise(exerciseIndex, { ...exercise, notes: e.target.value })}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div>
                  <Label htmlFor="workoutNotes">Workout Notes</Label>
                  <Textarea
                    id="workoutNotes"
                    placeholder="Working sets per group: Delts - 7, Chest - 10, Tricep - 8"
                    value={strengthTraining.workoutNotes}
                    onChange={(e) => setStrengthTraining(prev => ({ ...prev, workoutNotes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={() => handleStructuredSubmit('strength', { strengthTraining }, `${strengthTraining.title} workout`)}
                  className="w-full"
                  disabled={!strengthTraining.title || strengthTraining.exercises.length === 0}
                >
                  Submit Strength Training
                </Button>
              </div>
            </TabsContent>

            {/* File Upload */}
            <TabsContent value="files" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fileUpload">Upload Files</Label>
                  <Input
                    id="fileUpload"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.txt"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports: PDF, JPG, PNG, TXT (max 10MB each)
                  </p>
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files ({files.length})</Label>
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded border">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-accent" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Badge>
                        </div>
                        <Button
                          onClick={() => removeFile(index)}
                          size="sm"
                          variant="ghost"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};