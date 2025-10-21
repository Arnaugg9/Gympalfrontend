import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Clock, Flame } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function VerDietas() {
  const navigate = useNavigate();

  // TODO: Fetch diet details from API - GET /api/diets/:id
  const mockDiet = {
    name: 'Dieta Definición',
    totalCalories: 2000,
    meals: [
      {
        id: 1,
        name: 'Desayuno',
        time: '08:00',
        calories: 450,
        foods: [
          { name: 'Avena', amount: '60g', calories: 230, protein: 8, carbs: 38, fat: 5 },
          { name: 'Claras de huevo', amount: '4 unidades', calories: 68, protein: 16, carbs: 0, fat: 0 },
          { name: 'Plátano', amount: '1 unidad', calories: 105, protein: 1, carbs: 27, fat: 0 },
        ],
      },
      {
        id: 2,
        name: 'Almuerzo',
        time: '13:00',
        calories: 600,
        foods: [
          { name: 'Pechuga de pollo', amount: '200g', calories: 330, protein: 62, carbs: 0, fat: 7 },
          { name: 'Arroz integral', amount: '80g', calories: 280, protein: 6, carbs: 58, fat: 2 },
          { name: 'Brócoli', amount: '150g', calories: 51, protein: 4, carbs: 10, fat: 0 },
        ],
      },
      {
        id: 3,
        name: 'Merienda',
        time: '17:00',
        calories: 300,
        foods: [
          { name: 'Yogurt griego', amount: '200g', calories: 130, protein: 20, carbs: 9, fat: 0 },
          { name: 'Almendras', amount: '30g', calories: 170, protein: 6, carbs: 6, fat: 15 },
        ],
      },
      {
        id: 4,
        name: 'Cena',
        time: '20:00',
        calories: 550,
        foods: [
          { name: 'Salmón', amount: '150g', calories: 280, protein: 35, carbs: 0, fat: 15 },
          { name: 'Batata', amount: '150g', calories: 130, protein: 2, carbs: 30, fat: 0 },
          { name: 'Espinacas', amount: '100g', calories: 23, protein: 3, carbs: 4, fat: 0 },
        ],
      },
    ],
  };

  const totalMacros = mockDiet.meals.reduce(
    (acc, meal) => {
      meal.foods.forEach((food) => {
        acc.protein += food.protein;
        acc.carbs += food.carbs;
        acc.fat += food.fat;
      });
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-white mb-2">{mockDiet.name}</h1>
            <p className="text-slate-400">{mockDiet.totalCalories} kcal totales</p>
          </div>
        </div>

        {/* Macros Summary */}
        <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50">
          <CardHeader>
            <CardTitle className="text-white">Distribución de Macros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-slate-400 text-sm mb-1">Proteínas</p>
                <p className="text-white text-2xl">{totalMacros.protein}g</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Carbohidratos</p>
                <p className="text-white text-2xl">{totalMacros.carbs}g</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Grasas</p>
                <p className="text-white text-2xl">{totalMacros.fat}g</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meals */}
        <div className="space-y-4">
          {mockDiet.meals.map((meal) => (
            <Card key={meal.id} className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    {meal.name}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {meal.time}
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Flame className="h-4 w-4" />
                      {meal.calories} kcal
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {meal.foods.map((food, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                      <div>
                        <h4 className="text-white">{food.name}</h4>
                        <p className="text-slate-400 text-sm">{food.amount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white">{food.calories} kcal</p>
                        <p className="text-slate-400 text-xs">
                          P: {food.protein}g • C: {food.carbs}g • G: {food.fat}g
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
