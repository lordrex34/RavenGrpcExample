// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "ExampleCppPlayerData.generated.h"

UCLASS()
class RAVENGRPCEXAMPLE_API AExampleCppPlayerData : public AActor
{
	GENERATED_BODY()

public:
	// Sets default values for this actor's properties
	AExampleCppPlayerData();

protected:
	// Called when the game starts or when spawned
	virtual void BeginPlay() override;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "gRPC", meta = (ClampMin = "1", UIMin = "1"))
	int32 PlayerId = 1;
};
